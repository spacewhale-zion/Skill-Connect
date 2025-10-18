import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext.tsx';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import useFcmToken from '../../hooks/useFCMtoken.ts';
import * as THREE from "three";

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { token: fcmToken } = useFcmToken();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets: THREE.Mesh[] = [];
    const planetMaterials = [
        new THREE.MeshLambertMaterial({ color: 0x8A2BE2 }),
        new THREE.MeshLambertMaterial({ color: 0x00BFFF }),
        new THREE.MeshLambertMaterial({ color: 0x32CD32 }),
    ];
    const planetRadii = [5, 8, 7];
    const orbitRadii = [80, 110, 140];

    for (let i = 0; i < planetMaterials.length; i++) {
        const planetGeometry = new THREE.SphereGeometry(planetRadii[i], 16, 16);
        const planet = new THREE.Mesh(planetGeometry, planetMaterials[i]);
        planets.push(planet);
        scene.add(planet);
    }
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        stars.rotation.x = elapsedTime * 0.02;
        stars.rotation.y = elapsedTime * 0.01;
        const pulseScale = 1 + Math.sin(elapsedTime * 1.5) * 0.1;
        sun.scale.set(pulseScale, pulseScale, pulseScale);
        planets.forEach((planet, index) => {
            const orbitSpeed = 0.5 + index * 0.2;
            planet.position.x = Math.cos(elapsedTime * orbitSpeed * 0.1) * orbitRadii[index];
            planet.position.z = Math.sin(elapsedTime * orbitSpeed * 0.1) * orbitRadii[index];
            planet.rotation.y = elapsedTime * 0.5;
        });
        renderer.render(scene, camera);
    }
    animate();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
        window.removeEventListener('resize', onWindowResize);
        renderer.dispose();
    };
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.loading('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        toast.success('Location found!');
        setLongitude(position.coords.longitude.toString());
        setLatitude(position.coords.latitude.toString());
      },
      () => {
        toast.dismiss();
        toast.error('Unable to retrieve your location.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        location: {
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        fcmToken: fcmToken || undefined,
      });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white overflow-hidden">
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full opacity-50 z-0"
        ></canvas>

        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Join Skill<span className="text-yellow-400">Connect</span></h2>
                <p className="mt-2 text-slate-300">Create your account to get started.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-300">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="Your Name"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="you@example.com"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="••••••••"/>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Location</label>
                <button type="button" onClick={handleGetLocation} className="px-3 py-1 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 transition">Get My Location</button>
                </div>
                <div className="flex space-x-2">
                <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required className={`w-1/2 mt-1 ${inputStyles}`}/>
                <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required className={`w-1/2 mt-1 ${inputStyles}`}/>
                </div>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none disabled:bg-yellow-400/50 transition-colors"
            >
                {isSubmitting ? 'Registering...' : 'Create Account'}
            </button>
            </form>
            <p className="text-sm text-center text-slate-400">
                Already have an account?{' '}
            <Link to="/login" className="font-medium text-yellow-400 hover:underline">
                Login here
            </Link>
            </p>
        </div>
    </div>
  );
};

export default RegisterPage;