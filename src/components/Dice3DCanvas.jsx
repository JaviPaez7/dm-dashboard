import React, { useEffect, useRef } from "react";

// --- BASE VERTICES OF AN ICOSAHEDRON (d20) ---
const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
const RAW_VERTICES = [
  [-1,  phi,  0],
  [ 1,  phi,  0],
  [-1, -phi,  0],
  [ 1, -phi,  0],
  [ 0, -1,  phi],
  [ 0,  1,  phi],
  [ 0, -1, -phi],
  [ 0,  1, -phi],
  [ phi,  0, -1],
  [ phi,  0,  1],
  [-phi,  0, -1],
  [-phi,  0,  1],
];

// Normalizamos los vértices para que estén inscritos en una esfera de radio 1
const baseVertices = RAW_VERTICES.map(([x, y, z]) => {
  const len = Math.sqrt(x * x + y * y + z * z);
  return [x / len, y / len, z / len];
});

// --- FACES (TRIÁNGULOS) DEL ICOSAHEDRO ---
const faces = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
];

// Asignación de números del 1 al 20 a cada cara
const faceNumbers = [
  20, 2, 14, 8, 12, 
  6, 4, 18, 10, 16, 
  1, 19, 7, 13, 9, 
  15, 17, 3, 5, 11
];

// Calcular las normales de las caras en la posición base
const faceNormals = faces.map((face) => {
  const A = baseVertices[face[0]];
  const B = baseVertices[face[1]];
  const C = baseVertices[face[2]];
  
  // Vector AB y AC
  const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const ac = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
  
  // Producto vectorial AB x AC
  let nx = ab[1] * ac[2] - ab[2] * ac[1];
  let ny = ab[2] * ac[0] - ab[0] * ac[2];
  let nz = ab[0] * ac[1] - ab[1] * ac[0];
  
  // Normalizar
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  nx /= len; ny /= len; nz /= len;
  
  // Centro
  const cx = (A[0] + B[0] + C[0]) / 3;
  const cy = (A[1] + B[1] + C[1]) / 3;
  const cz = (A[2] + B[2] + C[2]) / 3;
  
  // Asegurar que apunte hacia afuera
  if (nx * cx + ny * cy + nz * cz < 0) {
    return [-nx, -ny, -nz];
  }
  return [nx, ny, nz];
});

// Helper para multiplicar matriz 3x3 por vector 3x1
const multiplyMatrixVector = (M, V) => {
  return [
    M[0][0]*V[0] + M[0][1]*V[1] + M[0][2]*V[2],
    M[1][0]*V[0] + M[1][1]*V[1] + M[1][2]*V[2],
    M[2][0]*V[0] + M[2][1]*V[1] + M[2][2]*V[2],
  ];
};

// Helper para multiplicar dos matrices 3x3
const multiplyMatrices = (A, B) => {
  const C = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + A[i][2]*B[2][j];
    }
  }
  return C;
};

// Crear una matriz de rotación sobre un eje arbitrario
const makeRotationMatrix = (axis, angle) => {
  const [ux, uy, uz] = axis;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const omc = 1.0 - c;
  return [
    [c + ux*ux*omc, ux*uy*omc - uz*s, ux*uz*omc + uy*s],
    [uy*ux*omc + uz*s, c + uy*uy*omc, uy*uz*omc - ux*s],
    [uz*ux*omc - uy*s, uz*uy*omc + ux*s, c + uz*uz*omc]
  ];
};

const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

const Dice3DCanvas = ({ result, onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Redimensionar Canvas a pantalla completa
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // --- CONFIGURACIÓN FÍSICA ---
    let x = canvas.width / 2;
    let y = -120; // Aparece fuera de pantalla arriba
    let z = 0;
    
    // Velocidades aleatorias
    let vx = (Math.random() - 0.5) * 16; // Velocidad X
    let vy = 12 + Math.random() * 8; // Cae hacia abajo rápido
    let vz = (Math.random() - 0.5) * 4;

    const gravity = 0.6;
    const bounceCoeffX = 0.75;
    const bounceCoeffY = 0.65;
    const frictionX = 0.98;

    // --- CONFIGURACIÓN ROTACIÓN ---
    // Matriz de rotación acumulada actual
    let M_current = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    // Eje de rotación aleatoria inicial
    const spinAxis = [Math.random(), Math.random(), Math.random()];
    const spinLength = Math.sqrt(spinAxis[0]*spinAxis[0] + spinAxis[1]*spinAxis[1] + spinAxis[2]*spinAxis[2]);
    spinAxis[0] /= spinLength; spinAxis[1] /= spinLength; spinAxis[2] /= spinLength;
    let spinSpeed = 0.2 + Math.random() * 0.15; // Velocidad de rotación inicial

    // --- CÁLCULO DE LA ORIENTACIÓN OBJETIVO ---
    const targetFaceIndex = faceNumbers.indexOf(result);
    const targetNormal = faceNormals[targetFaceIndex];

    // Construimos una base ortonormal donde el eje Z sea la normal de la cara destino
    const nzVec = [...targetNormal];
    let px = -nzVec[1], py = nzVec[0], pz = 0;
    if (Math.abs(nzVec[0]) < 0.1 && Math.abs(nzVec[1]) < 0.1) {
      px = 0; py = -nzVec[2]; pz = nzVec[1];
    }
    const pLen = Math.sqrt(px*px + py*py + pz*pz);
    px /= pLen; py /= pLen; pz /= pLen;
    // q = N x p
    const qx = nzVec[1]*pz - nzVec[2]*py;
    const qy = nzVec[2]*px - nzVec[0]*pz;
    const qz = nzVec[0]*py - nzVec[1]*px;

    // Matriz de rotación final que alinea el targetNormal con el eje Z (0, 0, 1)
    const M_final = [
      [px, py, pz],
      [qx, qy, qz],
      [nzVec[0], nzVec[1], nzVec[2]]
    ];

    // --- ESTADOS DE LA ANIMACIÓN ---
    let frame = 0;
    let particles = [];
    let shakeAmplitude = 0;
    let rollPhase = "rolling"; // "rolling" | "settling" | "done"
    let settleProgress = 0;
    let V_start_settle = []; // Guardará las posiciones rotadas al iniciar el frenado
    let size = 95; // Radio del dado

    // Crear chispa de impacto
    const spawnSparks = (px, py, count = 15) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.7) * 12,
          life: 1.0,
          decay: 0.03 + Math.random() * 0.04,
          color: Math.random() > 0.4 ? "#fcd34d" : "#ef4444" // Amarillo oro / Rojo fuego
        });
      }
    };

    // Vector de luz difusa
    const lightDir = [0.5, -0.5, -0.8];
    const lightLen = Math.sqrt(lightDir[0]*lightDir[0] + lightDir[1]*lightDir[1] + lightDir[2]*lightDir[2]);
    lightDir[0] /= lightLen; lightDir[1] /= lightLen; lightDir[2] /= lightLen;

    // --- LOOP PRINCIPAL ---
    const tick = () => {
      frame++;
      
      // Decay del screen-shake
      if (shakeAmplitude > 0.1) {
        shakeAmplitude *= 0.85;
      } else {
        shakeAmplitude = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Aplicar vibración de pantalla por impactos
      if (shakeAmplitude > 0) {
        const sx = (Math.random() - 0.5) * shakeAmplitude;
        const sy = (Math.random() - 0.5) * shakeAmplitude;
        ctx.translate(sx, sy);
      }

      // --- 1. ACTUALIZACIÓN FÍSICA ---
      if (rollPhase === "rolling") {
        vy += gravity;
        x += vx;
        y += vy;
        z += vz;

        // Rotar el dado acumulativamente
        const dM = makeRotationMatrix(spinAxis, spinSpeed);
        M_current = multiplyMatrices(dM, M_current);

        // Rebotes en los bordes izquierdo/derecho
        const rWidth = size * 1.2;
        if (x - rWidth < 0) {
          x = rWidth;
          vx = -vx * bounceCoeffX;
          spinSpeed *= 0.95;
          shakeAmplitude = Math.abs(vx) * 2;
          spawnSparks(0, y, 10);
        } else if (x + rWidth > canvas.width) {
          x = canvas.width - rWidth;
          vx = -vx * bounceCoeffX;
          spinSpeed *= 0.95;
          shakeAmplitude = Math.abs(vx) * 2;
          spawnSparks(canvas.width, y, 10);
        }

        // Rebote en el suelo (abajo)
        if (y + rWidth > canvas.height) {
          y = canvas.height - rWidth;
          vy = -vy * bounceCoeffY;
          vx *= frictionX;
          spinSpeed *= 0.85;
          shakeAmplitude = Math.abs(vy) * 2.5;
          spawnSparks(x, canvas.height, 12);
        }

        // Deceleración y fin de fase libre
        if (frame > 75 && Math.abs(vy) < 1.5 && Math.abs(vx) < 1.5) {
          rollPhase = "settling";
          // Capturar los vértices en su estado rotado actual antes de interpolar
          V_start_settle = baseVertices.map((v) => multiplyMatrixVector(M_current, v));
        }
      } else if (rollPhase === "settling") {
        settleProgress += 0.045; // Tarda unos 22 frames en asentarse
        if (settleProgress >= 1.0) {
          settleProgress = 1.0;
          rollPhase = "done";
          spawnSparks(x, y, 20); // Chispa final de celebración
          shakeAmplitude = 6;
          // Retrasar el cierre para que el usuario pueda ver el resultado asentado
          setTimeout(() => {
            onComplete();
          }, 1400);
        }

        // Interpolar posición hacia el centro de la pantalla
        const targetX = canvas.width / 2;
        const targetY = canvas.height / 2;
        x = lerp(x, targetX, settleProgress);
        y = lerp(y, targetY, settleProgress);
      }

      // --- 2. RENDERIZADO DE PARTÍCULAS ---
      particles = particles.filter((p) => {
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravedad leve de chispas
        if (p.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, 4 * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        return true;
      });

      // --- 3. PROYECCIÓN 3D Y DIBUJADO DEL DADO ---
      // Vértices rotados finales a renderizar
      let rotVertices = [];

      if (rollPhase === "rolling") {
        rotVertices = baseVertices.map((v) => multiplyMatrixVector(M_current, v));
      } else {
        // En fase de settling o listo, interpolamos entre la posición de inicio del settling y la alineación final
        const V_target_orient = baseVertices.map((v) => multiplyMatrixVector(M_final, v));
        rotVertices = baseVertices.map((v, i) => {
          const vs = V_start_settle[i];
          const vt = V_target_orient[i];
          return [
            lerp(vs[0], vt[0], settleProgress),
            lerp(vs[1], vt[1], settleProgress),
            lerp(vs[2], vt[2], settleProgress),
          ];
        });
      }

      // Proyectar vértices rotados a coordenadas de pantalla 2D
      const perspective = 300;
      const screenPoints = rotVertices.map(([rx, ry, rz]) => {
        // El eje Z va de -1 a 1 en el dado, le sumamos un offset de profundidad
        const scale = perspective / (perspective + rz * size);
        return {
          x: x + rx * size * scale,
          y: y + ry * size * scale,
          scale: scale,
          z: rz
        };
      });

      // Calcular normales actuales en el espacio rotado
      const currentNormals = faces.map((face) => {
        const A = rotVertices[face[0]];
        const B = rotVertices[face[1]];
        const C = rotVertices[face[2]];
        
        const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
        const ac = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        
        let nx = ab[1]*ac[2] - ab[2]*ac[1];
        let ny = ab[2]*ac[0] - ab[0]*ac[2];
        let nz = ab[0]*ac[1] - ab[1]*ac[0];
        
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        nx /= len; ny /= len; nz /= len;

        const cx = (A[0] + B[0] + C[0]) / 3;
        const cy = (A[1] + B[1] + C[1]) / 3;
        const cz = (A[2] + B[2] + C[2]) / 3;
        if (nx*cx + ny*cy + nz*cz < 0) {
          nx = -nx; ny = -ny; nz = -nz;
        }
        return [nx, ny, nz];
      });

      // Empaquetar caras con sus posiciones para ordenarlas (Painter's Algorithm)
      const renderFaces = faces.map((face, index) => {
        const A = screenPoints[face[0]];
        const B = screenPoints[face[1]];
        const C = screenPoints[face[2]];
        const avgZ = (A.z + B.z + C.z) / 3;

        return {
          faceIndex: index,
          faceIndices: face,
          avgZ: avgZ,
          normal: currentNormals[index],
          points: [A, B, C]
        };
      });

      // Ordenar de atrás hacia adelante (Z descendente, siendo Z positivo "hacia adentro")
      renderFaces.sort((a, b) => b.avgZ - a.avgZ);

      // Dibujar las caras visibles
      renderFaces.forEach((f) => {
        const nz = f.normal[2];

        // Backface culling: si apunta hacia adentro de la pantalla (Z > 0), no la dibujamos
        if (nz > 0.05) return;

        const [A, B, C] = f.points;
        const num = faceNumbers[f.faceIndex];

        // Sombreado difuso
        const cosTheta = f.normal[0]*lightDir[0] + f.normal[1]*lightDir[1] + f.normal[2]*lightDir[2];
        const intensity = Math.max(0.12, (cosTheta + 1) / 2);

        // Colores del dado (Rojo rubí oscuro / Borgoña del tema)
        const baseR = 122, baseG = 32, baseB = 8; // #7a2008
        const r = Math.round(baseR * intensity);
        const g = Math.round(baseG * intensity);
        const b = Math.round(baseB * intensity);

        // Estilos de los bordes y relleno
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.closePath();

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();

        // Líneas de corte doradas de D&D
        ctx.strokeStyle = "rgba(212, 175, 55, 0.4)"; // Oro translúcido
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- DIBUJAR NÚMERO ---
        // Solo dibujamos los números de las caras bastante visibles frontalmente
        if (nz < -0.15) {
          const tx = (A.x + B.x + C.x) / 3;
          const ty = (A.y + B.y + C.y) / 3;
          const scale = (A.scale + B.scale + C.scale) / 3;

          // Orientación del texto
          ctx.save();
          ctx.translate(tx, ty);

          // Escala y fuente (Cinzel / Serif del juego)
          ctx.font = `bold ${Math.round(22 * scale)}px 'Cinzel', serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Sombra para el texto para efecto 3D
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillText(num, 1, 1);

          // Color del texto (Oro brillante / Dorado)
          ctx.fillStyle = "#fcd34d";
          ctx.fillText(num, 0, 0);

          ctx.restore();
        }
      });

      // Resaltado / Aura final al asentarse
      if (rollPhase === "done") {
        ctx.beginPath();
        ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(252, 211, 77, 0.35)"; // Halo de oro
        ctx.lineWidth = 4;
        ctx.shadowColor = "#fcd34d";
        ctx.shadowBlur = 30;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      if (rollPhase !== "done" || frame % 2 === 0) {
        requestAnimationFrame(tick);
      }
    };

    const animFrame = requestAnimationFrame(tick);

    // Limpieza al desmontar
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [result, onComplete]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center w-full h-full bg-black/15">
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
    </div>
  );
};

export default Dice3DCanvas;
