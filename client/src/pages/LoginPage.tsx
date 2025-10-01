import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/authContext';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from "three";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
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
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 150;

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const sunGeometry = new THREE.SphereGeometry(50, 32, 32); 
    const sunMaterial = new THREE.MeshBasicMaterial({ color:'#facc15' });
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
        const orbitRadius = orbitRadii[index];
        planet.position.x = Math.cos(elapsedTime * orbitSpeed * 0.1) * orbitRadius;
        planet.position.z = Math.sin(elapsedTime * orbitSpeed * 0.1) * orbitRadius;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to log in. Please check your credentials.');
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
          <h2 className="text-3xl font-bold text-white">
            Welcome Back to Skill<span className="text-yellow-400">Connect</span>
          </h2>
          <p className="mt-2 text-slate-300">Log in to continue your journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="••••••••" />
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-medium text-slate-400 hover:text-yellow-400">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 focus:ring-offset-slate-800 transition-colors">
            Login
          </button>
        </form>
        <p className="text-sm text-center text-slate-300">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-yellow-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;