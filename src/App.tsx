import { useState, useEffect, useRef, useCallback } from 'react';

interface MoonData {
  name: string;
  nameRu: string;
  orbitRadius: number;
  size: number;
  color: string;
  speed: number; // relative orbital speed multiplier
  description?: string;
}

interface PlanetData {
  name: string;
  nameRu: string;
  diameter: number;
  distanceFromSun: number;
  orbitalPeriod: number;
  orbitRadius: number;
  size: number;
  color: string;
  glowColor: string;
  description: string;
  moons: MoonData[];
}

interface IntruderData {
  id: number;
  x: number;
  y: number;
  heading: number;
  speed: number;
  acceleration: number;
  targetPlanetIndex: number | null;
  phase: 'segment' | 'approach' | 'black-hole';
  phaseRemaining: number;
  segmentsRemaining: number;
  trail: { x: number; y: number }[];
}

interface ExplosionData {
  id: number;
  x: number;
  y: number;
  fragments: ExplosionFragment[];
}

interface ExplosionFragment {
  angle: number;
  distance: number;
  rotation: number;
  width: number;
  height: number;
  delay: number;
  color: string;
}

const planets: PlanetData[] = [
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    diameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    orbitRadius: 70,
    size: 6,
    color: '#b5b5b5',
    glowColor: '#8a8a8a',
    description: 'Самая маленькая и ближайшая к Солнцу планета.',
    moons: [],
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    diameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    orbitRadius: 105,
    size: 10,
    color: '#e8cda0',
    glowColor: '#d4a84b',
    description: 'Самая горячая планета с плотной атмосферой из CO₂.',
    moons: [],
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    diameter: 12756,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    orbitRadius: 145,
    size: 11,
    color: '#4da6ff',
    glowColor: '#2980b9',
    description: 'Наш дом — единственная планета с известной жизнью.',
    moons: [
      { name: 'Moon', nameRu: 'Луна', orbitRadius: 16, size: 3, color: '#d4d4d4', speed: 1.0 },
    ],
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    diameter: 6792,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    orbitRadius: 190,
    size: 8,
    color: '#e74c3c',
    glowColor: '#c0392b',
    description: 'Красная планета — цель будущих межпланетных миссий.',
    moons: [
      { name: 'Phobos', nameRu: 'Фобос', orbitRadius: 12, size: 2, color: '#a89080', speed: 2.5 },
      { name: 'Deimos', nameRu: 'Деймос', orbitRadius: 17, size: 1.5, color: '#b0a090', speed: 1.2 },
    ],
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    diameter: 142984,
    distanceFromSun: 778.6,
    orbitalPeriod: 4333,
    orbitRadius: 260,
    size: 22,
    color: '#e8a954',
    glowColor: '#d4843a',
    description: 'Крупнейшая планета — газовый гигант с Большим Красным Пятном.',
    moons: [
      { name: 'Io', nameRu: 'Ио', orbitRadius: 20, size: 3, color: '#f5e642', speed: 3.0 },
      { name: 'Europa', nameRu: 'Европа', orbitRadius: 26, size: 2.5, color: '#c8dce8', speed: 2.0 },
      { name: 'Ganymede', nameRu: 'Ганимед', orbitRadius: 33, size: 3.5, color: '#b8a888', speed: 1.2 },
      { name: 'Callisto', nameRu: 'Каллисто', orbitRadius: 40, size: 3, color: '#8a7a6a', speed: 0.7 },
    ],
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    diameter: 120536,
    distanceFromSun: 1433.5,
    orbitalPeriod: 10759,
    orbitRadius: 330,
    size: 19,
    color: '#f0d58c',
    glowColor: '#c9a83a',
    description: 'Знаменита своими великолепными кольцами из льда и камней.',
    moons: [
      { name: 'Titan', nameRu: 'Титан', orbitRadius: 28, size: 3.5, color: '#e8c870', speed: 1.0 },
      { name: 'Rhea', nameRu: 'Рея', orbitRadius: 22, size: 2, color: '#c0c0c0', speed: 1.8 },
      { name: 'Enceladus', nameRu: 'Энцелад', orbitRadius: 17, size: 1.5, color: '#f0f0ff', speed: 3.0 },
    ],
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    diameter: 51118,
    distanceFromSun: 2872.5,
    orbitalPeriod: 30687,
    orbitRadius: 395,
    size: 15,
    color: '#7ecfc0',
    glowColor: '#45b7a0',
    description: 'Ледяной гигант, вращающийся «на боку» — ось наклонена на 98°.',
    moons: [
      { name: 'Titania', nameRu: 'Титания', orbitRadius: 20, size: 2.5, color: '#c8c8c8', speed: 1.0 },
      { name: 'Oberon', nameRu: 'Оберон', orbitRadius: 26, size: 2.5, color: '#b0b0b0', speed: 0.7 },
      { name: 'Miranda', nameRu: 'Миранда', orbitRadius: 14, size: 1.5, color: '#d0d0d0', speed: 2.5 },
    ],
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    diameter: 49528,
    distanceFromSun: 4495.1,
    orbitalPeriod: 60190,
    orbitRadius: 450,
    size: 14,
    color: '#3498db',
    glowColor: '#2471a3',
    description: 'Самая далёкая планета с самыми сильными ветрами в Солнечной системе.',
    moons: [
      { name: 'Triton', nameRu: 'Тритон', orbitRadius: 20, size: 3, color: '#a8c8d8', speed: 1.0 },
      { name: 'Nereid', nameRu: 'Нереида', orbitRadius: 28, size: 1.5, color: '#909090', speed: 0.3 },
    ],
  },
];

// Total moon count for initializing moon angles
const totalMoonsCount = planets.reduce((sum, p) => sum + p.moons.length, 0);

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showMoons, setShowMoons] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [destroyedPlanets, setDestroyedPlanets] = useState<Set<number>>(
    () => new Set()
  );
  const [intruders, setIntruders] = useState<IntruderData[]>([]);
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);

  const [angles, setAngles] = useState<number[]>(() =>
    planets.map(() => Math.random() * Math.PI * 2)
  );
  const anglesRef = useRef(angles);
  const destroyedPlanetsRef = useRef(destroyedPlanets);
  const intrudersRef = useRef(intruders);
  const [moonAngles, setMoonAngles] = useState<number[]>(() =>
    Array.from({ length: totalMoonsCount }, () => Math.random() * Math.PI * 2)
  );

  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        // Earth completes 1 orbit in 60 seconds at speed=1
        const EARTH_ORBIT_MS = 60000;
        const EARTH_PERIOD_DAYS = 365.25;

        const nextAngles = anglesRef.current.map((angle, i) => {
          // Angular speed proportional to Earth: faster for inner planets, slower for outer
          const angularSpeed =
            ((2 * Math.PI) / EARTH_ORBIT_MS) *
            (EARTH_PERIOD_DAYS / planets[i].orbitalPeriod);
          return angle + angularSpeed * delta * speed;
        });
        anglesRef.current = nextAngles;
        setAngles(nextAngles);

        // Moon (Луна) completes 1 orbit in 5 seconds, independent of planet speed.
        // Other moons are relative to that via moon.speed multiplier.
        const MOON_BASE_ORBIT_MS = 5000;

        setMoonAngles((prev) => {
          let moonIdx = 0;
          return prev.map((angle) => {
            let cumIdx = 0;
            for (let p = 0; p < planets.length; p++) {
              for (let m = 0; m < planets[p].moons.length; m++) {
                if (cumIdx === moonIdx) {
                  const moonMultiplier = planets[p].moons[m].speed;
                  const angularSpeed =
                    ((2 * Math.PI) / MOON_BASE_ORBIT_MS) * moonMultiplier;
                  moonIdx++;
                  return angle + angularSpeed * delta;
                }
                cumIdx++;
              }
            }
            return angle;
          });
        });

        const intruderDelta = delta;
        const nextIntruders: IntruderData[] = [];
        for (const intruder of intrudersRef.current) {
          let {
            x,
            y,
            heading,
            speed: intruderSpeed,
            acceleration,
            targetPlanetIndex,
            phase,
            phaseRemaining,
            segmentsRemaining,
            trail,
          } = intruder;

          if (
            targetPlanetIndex !== null &&
            destroyedPlanetsRef.current.has(targetPlanetIndex)
          ) {
            targetPlanetIndex = planets.findIndex(
              (_, index) => !destroyedPlanetsRef.current.has(index)
            );
            if (targetPlanetIndex === -1) {
              targetPlanetIndex = null;
              phase = 'black-hole';
              phaseRemaining = 1600;
            } else {
              phase = 'approach';
              phaseRemaining = 1100;
            }
          }

          if (phase === 'segment') {
            const segmentTime = Math.min(intruderDelta, phaseRemaining) / 1000;
            const distance =
              intruderSpeed * segmentTime +
              0.5 * acceleration * segmentTime * segmentTime;
            x += Math.cos(heading) * distance;
            y += Math.sin(heading) * distance;
            intruderSpeed += acceleration * segmentTime;
            phaseRemaining -= intruderDelta;

            if (phaseRemaining <= 0) {
              if (segmentsRemaining > 1) {
                heading += (Math.random() < 0.5 ? -1 : 1) *
                  (Math.PI * 0.55 + Math.random() * Math.PI * 0.7);
                intruderSpeed *= 0.65;
                segmentsRemaining -= 1;
                phaseRemaining = 500 + Math.random() * 350;
              } else {
                phase = 'approach';
                phaseRemaining = 1100;
              }
            }
          }

          if (phase === 'approach' && targetPlanetIndex !== null) {
            const target = planets[targetPlanetIndex];
            const targetX = 460 + Math.cos(nextAngles[targetPlanetIndex]) * target.orbitRadius;
            const targetY = 460 + Math.sin(nextAngles[targetPlanetIndex]) * target.orbitRadius;
            const approachStep = Math.min(1, intruderDelta / Math.max(1, phaseRemaining));
            heading = Math.atan2(targetY - y, targetX - x);
            x += (targetX - x) * approachStep;
            y += (targetY - y) * approachStep;
            phaseRemaining -= intruderDelta;

            if (phaseRemaining <= 0) {
              const explosion = {
                id: intruder.id,
                x: targetX,
                y: targetY,
                fragments: Array.from({ length: 20 }, () => ({
                  angle: Math.random() * Math.PI * 2,
                  distance: 45 + Math.random() * 100,
                  rotation: (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 480),
                  width: 3 + Math.random() * 5,
                  height: 5 + Math.random() * 9,
                  delay: Math.random() * 100,
                  color: [target.color, target.glowColor, '#fff3b0', '#ffffff'][
                    Math.floor(Math.random() * 4)
                  ],
                })),
              };
              const updatedDestroyed = new Set(destroyedPlanetsRef.current);
              updatedDestroyed.add(targetPlanetIndex);
              destroyedPlanetsRef.current = updatedDestroyed;
              setDestroyedPlanets(updatedDestroyed);
              setSelectedPlanet((selected) =>
                selected?.name === target.name ? null : selected
              );
              setExplosions((current) => [...current, explosion]);
              continue;
            }
          } else if (phase === 'black-hole') {
            const approachStep = Math.min(1, intruderDelta / Math.max(1, phaseRemaining));
            heading = Math.atan2(460 - y, 460 - x);
            x += (460 - x) * approachStep;
            y += (460 - y) * approachStep;
            phaseRemaining -= intruderDelta;

            if (phaseRemaining <= 0) {
              continue;
            }
          }

          if (phase === 'segment') {
            x = Math.max(16, Math.min(904, x));
            y = Math.max(16, Math.min(904, y));
          }

          trail = [...trail, { x, y }].slice(-8);
          nextIntruders.push({
            ...intruder,
            x,
            y,
            heading,
            speed: intruderSpeed,
            targetPlanetIndex,
            phase,
            phaseRemaining,
            segmentsRemaining,
            trail,
          });
        }
        intrudersRef.current = nextIntruders;
        setIntruders(nextIntruders);
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isPlaying, speed]
  );

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Reset zoom when deselecting planet
  useEffect(() => {
    if (!selectedPlanet) {
      setIsZoomed(false);
    }
  }, [selectedPlanet]);

  const getSpeedLabel = (s: number): string => {
    if (s === 0.01) return '0.01×';
    if (s === 0.25) return '0.25×';
    if (s === 0.5) return '0.5×';
    if (s === 1) return '1×';
    if (s === 2) return '2×';
    if (s === 5) return '5×';
    if (s === 10) return '10×';
    return `${s}×`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  const createIntruder = () => {
    const container = containerRef.current;
    const stage = container?.parentElement;
    const bounds = container?.getBoundingClientRect();
    const stageBounds = stage?.getBoundingClientRect();
    const scale = bounds && bounds.width > 0 ? bounds.width / 920 : 1;
    const left = Math.max(bounds?.left ?? 0, stageBounds?.left ?? 0, 0);
    const top = Math.max(bounds?.top ?? 0, stageBounds?.top ?? 0, 0);
    const right = Math.min(
      bounds?.right ?? 920,
      stageBounds?.right ?? window.innerWidth,
      window.innerWidth
    );
    const bottom = Math.min(
      bounds?.bottom ?? 920,
      stageBounds?.bottom ?? window.innerHeight,
      window.innerHeight
    );
    const screenX = left + Math.random() * Math.max(0, right - left);
    const screenY = top + Math.random() * Math.max(0, bottom - top);
    const availablePlanets = planets
      .map((planet, index) => ({ planet, index }))
      .filter(({ index }) => !destroyedPlanetsRef.current.has(index));
    const targetPlanetIndex =
      availablePlanets.length > 0
        ? availablePlanets[Math.floor(Math.random() * availablePlanets.length)].index
        : null;
    const heading = Math.random() * Math.PI * 2;
    const intruder = {
      id: Date.now() + Math.random(),
      x: Math.max(16, Math.min(904, (screenX - (bounds?.left ?? 0)) / scale)),
      y: Math.max(16, Math.min(904, (screenY - (bounds?.top ?? 0)) / scale)),
      heading,
      speed: 45 + Math.random() * 30,
      acceleration: 100 + Math.random() * 70,
      targetPlanetIndex,
      phase: targetPlanetIndex === null ? 'black-hole' as const : 'segment' as const,
      phaseRemaining:
        targetPlanetIndex === null ? 1600 : 650 + Math.random() * 450,
      segmentsRemaining: 2 + Math.floor(Math.random() * 3),
      trail: [],
    };
    const nextIntruders = [...intrudersRef.current, intruder];
    intrudersRef.current = nextIntruders;
    setIntruders(nextIntruders);
  };

  const stars = useRef(
    Array.from({ length: 200 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      animationDelay: Math.random() * 3,
    }))
  ).current;

  // Calculate zoom transform — computed directly from current angles
  const getZoomStyle = (): React.CSSProperties => {
    if (!isZoomed) {
      return {
        width: '920px',
        height: '920px',
        transform: 'scale(1)',
        transformOrigin: 'center center',
      };
    }
    if (!selectedPlanet) {
      return {
        width: '920px',
        height: '920px',
        transform: 'scale(3.5)',
        transformOrigin: 'center center',
      };
    }
    const planetIdx = planets.findIndex((p) => p.name === selectedPlanet.name);
    const x = Math.cos(angles[planetIdx]) * selectedPlanet.orbitRadius;
    const y = Math.sin(angles[planetIdx]) * selectedPlanet.orbitRadius;
    return {
      width: '920px',
      height: '920px',
      transform: `scale(3.5) translate(${-x}px, ${-y}px)`,
      transformOrigin: 'center center',
    };
  };

  // Render moons for a planet
  const renderMoons = (planet: PlanetData, planetIdx: number) => {
    if (!showMoons || planet.moons.length === 0) return null;

    let moonStartIdx = 0;
    for (let i = 0; i < planetIdx; i++) {
      moonStartIdx += planets[i].moons.length;
    }

    return planet.moons.map((moon, moonIdx) => {
      const globalMoonIdx = moonStartIdx + moonIdx;
      const moonAngle = moonAngles[globalMoonIdx];
      const mx = Math.cos(moonAngle) * moon.orbitRadius;
      const my = Math.sin(moonAngle) * moon.orbitRadius;

      return (
        <div key={moon.name}>
          {/* Moon orbit path */}
          <div
            className="absolute rounded-full border border-white/5"
            style={{
              width: `${moon.orbitRadius * 2}px`,
              height: `${moon.orbitRadius * 2}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {/* Moon body */}
          <div
            className="absolute rounded-full"
            style={{
              width: `${moon.size}px`,
              height: `${moon.size}px`,
              left: `calc(50% + ${mx}px - ${moon.size / 2}px)`,
              top: `calc(50% + ${my}px - ${moon.size / 2}px)`,
              background: `radial-gradient(circle at 35% 35%, ${moon.color}, ${moon.color}90)`,
              boxShadow: `0 0 3px 1px ${moon.color}40`,
              zIndex: 15,
            }}
            title={moon.nameRu}
          />
        </div>
      );
    });
  };

  return (
    <div className="w-full h-screen bg-[#0a0a1a] overflow-hidden relative flex flex-col">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 text-center pt-4 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          🌌 Интерактивная Солнечная система
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Нажмите на планету для получения информации
        </p>
      </div>

      {/* Solar System Container */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="relative"
          style={getZoomStyle()}
        >
          {/* Sun */}
          <div
            className="absolute rounded-full cursor-pointer"
            style={{
              width: '50px',
              height: '50px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, #fff7a1 0%, #ffd700 30%, #ff8c00 70%, #ff4500 100%)',
              boxShadow: '0 0 40px 15px rgba(255, 165, 0, 0.5), 0 0 80px 30px rgba(255, 69, 0, 0.3), 0 0 120px 50px rgba(255, 165, 0, 0.15)',
            }}
            onClick={() => setSelectedPlanet(null)}
          />

          {/* Orbit paths */}
          {planets.map((planet, i) => (
            <div
              key={`orbit-${i}`}
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${planet.orbitRadius * 2}px`,
                height: `${planet.orbitRadius * 2}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Planets with Moons */}
          {planets.map((planet, i) => {
            if (destroyedPlanets.has(i)) return null;
            const x = Math.cos(angles[i]) * planet.orbitRadius;
            const y = Math.sin(angles[i]) * planet.orbitRadius;
            const isSelected = selectedPlanet?.name === planet.name;
            const isHovered = hoveredPlanet === planet.name;

            return (
              <div
                key={planet.name}
                className="absolute cursor-pointer"
                style={{
                  width: `${planet.size + 8}px`,
                  height: `${planet.size + 8}px`,
                  left: `calc(50% + ${x}px - ${(planet.size + 8) / 2}px)`,
                  top: `calc(50% + ${y}px - ${(planet.size + 8) / 2}px)`,
                  zIndex: isHovered || isSelected ? 20 : 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlanet(planet);
                }}
                onMouseEnter={() => setHoveredPlanet(planet.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {/* Planet body */}
                <div
                  className="w-full h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    margin: '4px',
                    background: `radial-gradient(circle at 35% 35%, ${planet.color}, ${planet.glowColor})`,
                    boxShadow: isHovered
                      ? `0 0 8px 3px ${planet.color}90`
                      : `0 0 4px 1px ${planet.color}60`,
                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                {/* Saturn rings */}
                {planet.name === 'Saturn' && (
                  <div
                    className="absolute rounded-full border-2 border-yellow-200/60 pointer-events-none"
                    style={{
                      width: `${planet.size + 14}px`,
                      height: `${planet.size * 0.35}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%) rotate(-20deg)',
                    }}
                  />
                )}
                {/* Planet label on hover */}
                {(isHovered || isSelected) && (
                  <div
                    className="absolute text-xs text-white font-medium whitespace-nowrap pointer-events-none"
                    style={{
                      bottom: `${planet.size + 12}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {planet.nameRu}
                  </div>
                )}

                {/* Moons container - positioned relative to planet center */}
                {showMoons && planet.moons.length > 0 && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: `${planet.moons.length > 0 ? Math.max(...planet.moons.map(m => m.orbitRadius)) * 2 + 10 : 0}px`,
                      height: `${planet.moons.length > 0 ? Math.max(...planet.moons.map(m => m.orbitRadius)) * 2 + 10 : 0}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {renderMoons(planet, i)}
                  </div>
                )}
              </div>
            );
          })}

          {intruders.some((intruder) => intruder.phase === 'black-hole') && (
            <div
              className="absolute z-20 pointer-events-none black-hole"
              style={{ left: '50%', top: '50%' }}
              aria-label="Чёрная дыра"
            >
              <div className="black-hole-disk" />
              <div className="black-hole-core" />
            </div>
          )}
          {intruders.map((intruder) => {
            const gradientPrefix = `ufo-${intruder.id.toString().replace('.', '-')}`;
            return (
              <div key={intruder.id}>
                {intruder.trail.map((point, index) => (
                  <div
                    key={`${intruder.id}-trail-${index}`}
                    className="absolute pointer-events-none intruder-trail"
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,
                      opacity: ((index + 1) / intruder.trail.length) * 0.65,
                      transform: `translate(-50%, -50%) scale(${0.4 + (index / Math.max(1, intruder.trail.length - 1)) * 0.9})`,
                    }}
                  />
                ))}
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    left: `${intruder.x}px`,
                    top: `${intruder.y}px`,
                    transform: `translate(-50%, -50%) rotate(${intruder.heading}rad)`,
                  }}
                >
                  <span className="animate-intruder block h-10 w-14 drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]">
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 64 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id={`${gradientPrefix}-hull`} x1="9" y1="20" x2="53" y2="39" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f1f5f9" />
                          <stop offset=".38" stopColor="#94a3b8" />
                          <stop offset=".72" stopColor="#475569" />
                          <stop offset="1" stopColor="#cbd5e1" />
                        </linearGradient>
                        <linearGradient id={`${gradientPrefix}-dome`} x1="21" y1="8" x2="44" y2="29" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ecfeff" stopOpacity=".95" />
                          <stop offset=".35" stopColor="#67e8f9" stopOpacity=".82" />
                          <stop offset="1" stopColor="#0e7490" stopOpacity=".9" />
                        </linearGradient>
                        <radialGradient id={`${gradientPrefix}-engine`} cx="0" cy="0" r="1" gradientTransform="matrix(0 5 -19 0 32 36)" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#a5f3fc" stopOpacity=".95" />
                          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      <ellipse cx="32" cy="37" rx="19" ry="5" fill={`url(#${gradientPrefix}-engine)`} />
                      <path d="M32 8V3" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="32" cy="2.5" r="2" fill="#67e8f9" />
                      <circle cx="32" cy="2.5" r="3.5" fill="#67e8f9" fillOpacity=".2" />

                      <path
                        d="M20 24c0-10 5-16 12-16s12 6 12 16"
                        fill={`url(#${gradientPrefix}-dome)`}
                        stroke="#e0f2fe"
                        strokeWidth="1.5"
                      />
                      <path d="M23 20c1-5 3-8 6-10" stroke="white" strokeOpacity=".75" strokeWidth="1.5" strokeLinecap="round" />
                      <ellipse cx="32" cy="21" rx="6" ry="5" fill="#164e63" fillOpacity=".72" />
                      <circle cx="29.5" cy="20" r="1.2" fill="#cffafe" />
                      <circle cx="34.5" cy="20" r="1.2" fill="#cffafe" />

                      <path
                        d="M5 26c5-6 16-10 27-10s22 4 27 10l-5 7c-7 4-14 6-22 6s-15-2-22-6l-5-7Z"
                        fill={`url(#${gradientPrefix}-hull)`}
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                      <path d="M7 26c9 5 41 5 50 0" stroke="#f8fafc" strokeOpacity=".8" strokeWidth="1.5" />
                      <path d="M11 31c11 4 31 4 42 0" stroke="#334155" strokeOpacity=".9" strokeWidth="1" />
                      <path d="M13 34c6 2 11 3 19 3s13-1 19-3" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />

                      <circle cx="13" cy="27.5" r="1.5" fill="#67e8f9" />
                      <circle cx="21" cy="29" r="1.3" fill="#f0abfc" />
                      <circle cx="32" cy="29.5" r="1.5" fill="#e0f2fe" />
                      <circle cx="43" cy="29" r="1.3" fill="#f0abfc" />
                      <circle cx="51" cy="27.5" r="1.5" fill="#67e8f9" />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
          {explosions.map((explosion) => (
            <div
              key={explosion.id}
              className="absolute pointer-events-none z-30 planet-explosion"
              style={{
                left: `${explosion.x}px`,
                top: `${explosion.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                setExplosions((current) =>
                  current.filter((item) => item.id !== explosion.id)
                );
              }}
            >
              <div className="explosion-wave explosion-wave-primary" />
              <div className="explosion-wave explosion-wave-secondary" />
              <div className="explosion-flash" />
              {explosion.fragments.map((fragment, index) => (
                <span
                  key={`${explosion.id}-fragment-${index}`}
                  className="explosion-fragment"
                  style={{
                    '--fragment-angle': `${fragment.angle}rad`,
                    '--fragment-distance': `${fragment.distance}px`,
                    '--fragment-rotation': `${fragment.rotation}deg`,
                    '--fragment-width': `${fragment.width}px`,
                    '--fragment-height': `${fragment.height}px`,
                    '--fragment-delay': `${fragment.delay}ms`,
                    '--fragment-color': fragment.color,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 md:right-8 z-30 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl p-5 w-72 shadow-2xl animate-fade-in">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            onClick={() => setSelectedPlanet(null)}
          >
            ✕
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${selectedPlanet.color}, ${selectedPlanet.glowColor})`,
                boxShadow: `0 0 10px 3px ${selectedPlanet.color}60`,
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-white">{selectedPlanet.nameRu}</h2>
              <p className="text-xs text-gray-400">{selectedPlanet.name}</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-4">{selectedPlanet.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm">📏 Диаметр</span>
              <span className="text-white font-medium text-sm">
                {formatNumber(selectedPlanet.diameter)} км
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm">☀️ Расстояние</span>
              <span className="text-white font-medium text-sm">
                {formatNumber(selectedPlanet.distanceFromSun)} млн км
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm">🔄 Орбитальный период</span>
              <span className="text-white font-medium text-sm">
                {selectedPlanet.orbitalPeriod >= 365
                  ? `${(selectedPlanet.orbitalPeriod / 365.25).toFixed(1)} лет`
                  : `${selectedPlanet.orbitalPeriod} дней`}
              </span>
            </div>
            {selectedPlanet.moons.length > 0 && (
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-400 text-sm">🌙 Спутники</span>
                <span className="text-white font-medium text-sm">
                  {selectedPlanet.moons.map((m) => m.nameRu).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-10 pb-4 pt-2 px-4">
        <div className="max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/30"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Пауза
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Старт
                </>
              )}
            </button>

            {/* Zoom Button */}
            <button
              onClick={handleZoom}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                isZoomed
                  ? 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/30'
              }`}
            >
              {isZoomed ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Отдалить
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Приблизить
                </>
              )}
            </button>

            {/* Moons Toggle */}
            <button
              onClick={() => setShowMoons(!showMoons)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                showMoons
                  ? 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/30'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <span className="text-lg">🌙</span>
              {showMoons ? 'Спутники: ВКЛ' : 'Спутники: ВЫКЛ'}
            </button>

            <button
              onClick={createIntruder}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-300 hover:bg-sky-200 text-slate-950 font-medium transition-all duration-200 shadow-lg hover:shadow-sky-300/30"
            >
              <span className="text-lg">🛸</span>
              Intruders
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Скорость:</span>
              <div className="flex gap-1 flex-wrap justify-center">
                {[0.01, 0.25, 0.5, 1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      speed === s
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {getSpeedLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planet quick-select */}
          <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
            {planets.map((planet, index) => {
              if (destroyedPlanets.has(index)) return null;
              return (
                <button
                  key={planet.name}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                    selectedPlanet?.name === planet.name
                      ? 'bg-gray-700 text-white ring-1 ring-gray-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${planet.color}, ${planet.glowColor})`,
                    }}
                  />
                  {planet.nameRu}
                  {planet.moons.length > 0 && showMoons && (
                    <span className="text-gray-500 text-[10px]">({planet.moons.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
