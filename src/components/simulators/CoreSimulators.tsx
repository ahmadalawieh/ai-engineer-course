'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, StepForward } from 'lucide-react';

/* 1. Vector Space & 2x2 Matrix Transform */
export function VectorSpaceSim() {
  const [m11, setM11] = useState(1.2);
  const [m12, setM12] = useState(0.5);
  const [m21, setM21] = useState(-0.3);
  const [m22, setM22] = useState(1.0);
  const [vx, setVx] = useState(1.5);
  const [vy, setVy] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tx = m11 * vx + m12 * vy;
  const ty = m21 * vx + m22 * vy;
  const det = m11 * m22 - m12 * m21;
  const dot = vx * tx + vy * ty;
  const magV = Math.hypot(vx, vy) || 1;
  const magT = Math.hypot(tx, ty) || 1;
  const cosine = dot / (magV * magT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 42;

    ctx.clearRect(0, 0, w, h);

    // Subtle transformed grid
    ctx.strokeStyle = 'rgba(128,128,128,0.16)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      // transformed vertical lines
      ctx.beginPath();
      ctx.moveTo(cx + (m11 * i + m12 * -5) * scale, cy - (m21 * i + m22 * -5) * scale);
      ctx.lineTo(cx + (m11 * i + m12 * 5) * scale, cy - (m21 * i + m22 * 5) * scale);
      ctx.stroke();
      // transformed horizontal lines
      ctx.beginPath();
      ctx.moveTo(cx + (m11 * -5 + m12 * i) * scale, cy - (m21 * -5 + m22 * i) * scale);
      ctx.lineTo(cx + (m11 * 5 + m12 * i) * scale, cy - (m21 * 5 + m22 * i) * scale);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(128,128,128,0.45)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    const drawVec = (x: number, y: number, color: string, label: string) => {
      const px = cx + x * scale;
      const py = cy - y * scale;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '12px monospace';
      ctx.fillText(label, px + 7, py - 6);
    };

    drawVec(m11, m21, '#0f766e', 'i-hat');
    drawVec(m12, m22, '#1d4ed8', 'j-hat');
    drawVec(vx, vy, '#71717a', 'v');
    drawVec(tx, ty, '#c84b31', 'Mv');
  }, [m11, m12, m21, m22, vx, vy, tx, ty]);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>M[0,0]: {m11.toFixed(1)}</span>
          <input type="range" min={-2} max={2} step={0.1} value={m11} onChange={(e) => setM11(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>M[0,1]: {m12.toFixed(1)}</span>
          <input type="range" min={-2} max={2} step={0.1} value={m12} onChange={(e) => setM12(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>M[1,0]: {m21.toFixed(1)}</span>
          <input type="range" min={-2} max={2} step={0.1} value={m21} onChange={(e) => setM21(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>M[1,1]: {m22.toFixed(1)}</span>
          <input type="range" min={-2} max={2} step={0.1} value={m22} onChange={(e) => setM22(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>v.x: {vx.toFixed(1)}</span>
          <input type="range" min={-2.5} max={2.5} step={0.1} value={vx} onChange={(e) => setVx(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>v.y: {vy.toFixed(1)}</span>
          <input type="range" min={-2.5} max={2.5} step={0.1} value={vy} onChange={(e) => setVy(+e.target.value)} />
        </label>
      </div>
      <div className="sim-canvas-wrap">
        <canvas ref={canvasRef} width={640} height={290} style={{ width: '100%', display: 'block' }} />
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">Mv = [{tx.toFixed(2)}, {ty.toFixed(2)}]</div>
        <div className="sim-metric">det(M) = {det.toFixed(2)} {Math.abs(det) < 0.05 ? '(Collapsed Rank!)' : ''}</div>
        <div className="sim-metric">v · Mv = {dot.toFixed(2)}</div>
        <div className="sim-metric">cos(θ) = {cosine.toFixed(3)}</div>
      </div>
    </div>
  );
}

/* 2. Gradient Descent Optimizer Race */
export function GradientDescentSim() {
  const [surface, setSurface] = useState<'ravine' | 'bowl' | 'saddle'>('ravine');
  const [lr, setLr] = useState(0.08);
  const [tick, setTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const grad = (x: number, y: number): [number, number] => {
    if (surface === 'bowl') return [2 * x, 2 * y];
    if (surface === 'ravine') return [0.5 * x, 6 * y];
    return [2 * x, -2 * y + 0.6 * y * y * y];
  };

  const paths = useMemo(() => {
    const start: [number, number] = surface === 'saddle' ? [2.2, 0.25] : [-2.6, 1.8];
    const sgd: Array<[number, number]> = [start];
    const mom: Array<[number, number]> = [start];
    const adam: Array<[number, number]> = [start];

    let [sx, sy] = start;
    let [mx, my] = start;
    let [mvx, mvy] = [0, 0];
    let [ax, ay] = start;
    let [amx, amy, avx, avy] = [0, 0, 0, 0];

    for (let t = 1; t <= 45; t++) {
      const [gsx, gsy] = grad(sx, sy);
      sx = Math.max(-4, Math.min(4, sx - lr * gsx));
      sy = Math.max(-4, Math.min(4, sy - lr * gsy));
      sgd.push([sx, sy]);

      const [gmx, gmy] = grad(mx, my);
      mvx = 0.85 * mvx + gmx;
      mvy = 0.85 * mvy + gmy;
      mx = Math.max(-4, Math.min(4, mx - lr * 0.4 * mvx));
      my = Math.max(-4, Math.min(4, my - lr * 0.4 * mvy));
      mom.push([mx, my]);

      const [gax, gay] = grad(ax, ay);
      amx = 0.9 * amx + 0.1 * gax;
      amy = 0.9 * amy + 0.1 * gay;
      avx = 0.999 * avx + 0.001 * gax * gax;
      avy = 0.999 * avy + 0.001 * gay * gay;
      const mhx = amx / (1 - Math.pow(0.9, t));
      const mhy = amy / (1 - Math.pow(0.9, t));
      const vhx = avx / (1 - Math.pow(0.999, t));
      const vhy = avy / (1 - Math.pow(0.999, t));
      ax = Math.max(-4, Math.min(4, ax - (lr * 1.4 * mhx) / (Math.sqrt(vhx) + 1e-6)));
      ay = Math.max(-4, Math.min(4, ay - (lr * 1.4 * mhy) / (Math.sqrt(vhy) + 1e-6)));
      adam.push([ax, ay]);
    }
    return { sgd, mom, adam };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, lr, tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw contour rings
    const toPx = (x: number, y: number): [number, number] => [
      w / 2 + (x / 3.4) * (w / 2),
      h / 2 - (y / 2.6) * (h / 2),
    ];

    for (let r = 0.4; r <= 3.2; r += 0.45) {
      ctx.strokeStyle = 'rgba(128,128,128,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (surface === 'ravine') {
        ctx.ellipse(w / 2, h / 2, r * 85, r * 28, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(w / 2, h / 2, r * 60, r * 55, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    const drawPath = (pts: Array<[number, number]>, color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const [px, py] = toPx(x, y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      const [lx, ly] = toPx(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPath(paths.sgd, '#c84b31');
    drawPath(paths.mom, '#1d4ed8');
    drawPath(paths.adam, '#0f766e');
  }, [paths, surface]);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Landscape</span>
          <select className="input" value={surface} onChange={(e) => setSurface(e.target.value as 'ravine' | 'bowl' | 'saddle')}>
            <option value="ravine">Steep Ravine (Ill-conditioned)</option>
            <option value="bowl">Isotropic Bowl</option>
            <option value="saddle">Saddle Escaper</option>
          </select>
        </label>
        <label className="sim-control">
          <span>Learning Rate η: {lr.toFixed(2)}</span>
          <input type="range" min={0.01} max={0.35} step={0.01} value={lr} onChange={(e) => setLr(+e.target.value)} />
        </label>
        <button type="button" className="btn btn-sm" onClick={() => setTick((t) => t + 1)}>
          <RotateCcw size={13} /> Replay
        </button>
      </div>
      <div className="sim-canvas-wrap">
        <canvas ref={canvasRef} width={640} height={260} style={{ width: '100%', display: 'block' }} />
      </div>
      <div className="sim-metrics">
        <div className="sim-metric" style={{ color: '#c84b31' }}>■ Vanilla SGD (oscillates in steep ravines)</div>
        <div className="sim-metric" style={{ color: '#1d4ed8' }}>■ Momentum</div>
        <div className="sim-metric" style={{ color: '#0f766e' }}>■ Adam (adaptive per-axis steps)</div>
      </div>
    </div>
  );
}

/* 3. Bayes & Cross-Entropy */
export function BayesEntropySim() {
  const [prevalence, setPrevalence] = useState(0.01);
  const [sensitivity, setSensitivity] = useState(0.95);
  const [fpr, setFpr] = useState(0.05);
  const [qTrue, setQTrue] = useState(0.8);

  const tp = prevalence * sensitivity;
  const fp = (1 - prevalence) * fpr;
  const ppv = tp / (tp + fp || 1);
  const crossEntropy = -Math.log(Math.max(0.001, qTrue));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
      <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
        <strong style={{ fontSize: '0.9rem' }}>Bayes Base-Rate Calculator</strong>
        <div className="sim-controls" style={{ marginTop: 10 }}>
          <label className="sim-control" style={{ width: '100%' }}>
            <span>Prior Prevalence: {(prevalence * 100).toFixed(1)}%</span>
            <input type="range" min={0.001} max={0.3} step={0.005} value={prevalence} onChange={(e) => setPrevalence(+e.target.value)} />
          </label>
          <label className="sim-control" style={{ width: '100%' }}>
            <span>Sensitivity (True Positive Rate): {(sensitivity * 100).toFixed(0)}%</span>
            <input type="range" min={0.5} max={0.99} step={0.01} value={sensitivity} onChange={(e) => setSensitivity(+e.target.value)} />
          </label>
          <label className="sim-control" style={{ width: '100%' }}>
            <span>False Positive Rate: {(fpr * 100).toFixed(1)}%</span>
            <input type="range" min={0.005} max={0.2} step={0.005} value={fpr} onChange={(e) => setFpr(+e.target.value)} />
          </label>
        </div>
        <div className="sim-metric">
          Posterior P(Fraud | Flagged) = <strong>{(ppv * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
        <strong style={{ fontSize: '0.9rem' }}>Cross-Entropy Loss Explorer</strong>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)', margin: '6px 0 10px' }}>
          Model predicted probability Q(true class): <strong>{(qTrue * 100).toFixed(0)}%</strong>
        </p>
        <input
          type="range"
          min={0.01}
          max={0.99}
          step={0.01}
          value={qTrue}
          onChange={(e) => setQTrue(+e.target.value)}
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: 14, height: 14, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (crossEntropy / 4.6) * 100)}%`,
              background: crossEntropy > 1.5 ? '#c84b31' : '#0f766e',
              transition: 'width 0.15s ease',
            }}
          />
        </div>
        <div className="sim-metrics">
          <div className="sim-metric">Loss = -ln(Q) = {crossEntropy.toFixed(3)}</div>
          <div className="sim-metric">Perplexity = {Math.exp(crossEntropy).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

/* 4. A/B Test Power & Sample Size */
export function AbTestSim() {
  const [baseline, setBaseline] = useState(0.1);
  const [mde, setMde] = useState(0.015);
  const [power, setPower] = useState(0.8);

  const zAlpha = 1.96;
  const zBeta = power >= 0.9 ? 1.28 : power >= 0.85 ? 1.04 : 0.84;
  const variance = baseline * (1 - baseline);
  const requiredPerVariant = Math.ceil((2 * variance * Math.pow(zAlpha + zBeta, 2)) / Math.pow(mde, 2));
  const dailyUsers = 8000;
  const days = Math.ceil((requiredPerVariant * 2) / dailyUsers);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Baseline Conv: {(baseline * 100).toFixed(1)}%</span>
          <input type="range" min={0.02} max={0.4} step={0.01} value={baseline} onChange={(e) => setBaseline(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>Abs Lift (MDE): +{(mde * 100).toFixed(1)}%</span>
          <input type="range" min={0.005} max={0.05} step={0.005} value={mde} onChange={(e) => setMde(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>Power (1 - β): {(power * 100).toFixed(0)}%</span>
          <select className="input" value={power} onChange={(e) => setPower(+e.target.value)}>
            <option value={0.8}>80% (Standard)</option>
            <option value={0.85}>85%</option>
            <option value={0.9}>90% (Strict)</option>
          </select>
        </label>
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">Sample / Variant: <strong>{requiredPerVariant.toLocaleString()}</strong></div>
        <div className="sim-metric">Total Users (50/50): <strong>{(requiredPerVariant * 2).toLocaleString()}</strong></div>
        <div className="sim-metric">Est. Days @ 8k/day: <strong>{Math.max(7, days)} days</strong> (min 7d cycle)</div>
      </div>
    </div>
  );
}

/* 5. ROC & Classification Threshold Cost Optimizer */
export function RocThresholdSim() {
  const [threshold, setThreshold] = useState(0.5);
  const [fnCost, setFnCost] = useState(250);
  const [fpCost, setFpCost] = useState(15);

  // Synthetic calibrated scores for 200 samples (30 positives, 170 negatives)
  const { tp, fp, fn, tn, precision, recall, f1, totalCost } = useMemo(() => {
    let tPos = 0;
    let fPos = 0;
    let fNeg = 0;
    let tNeg = 0;
    for (let i = 0; i < 30; i++) {
      const score = 0.25 + (i / 30) * 0.72;
      if (score >= threshold) tPos++;
      else fNeg++;
    }
    for (let i = 0; i < 170; i++) {
      const score = 0.03 + (i / 170) * 0.62;
      if (score >= threshold) fPos++;
      else tNeg++;
    }
    const prec = tPos / (tPos + fPos || 1);
    const rec = tPos / (tPos + fNeg || 1);
    const f1Val = (2 * prec * rec) / (prec + rec || 1);
    return {
      tp: tPos,
      fp: fPos,
      fn: fNeg,
      tn: tNeg,
      precision: prec,
      recall: rec,
      f1: f1Val,
      totalCost: fNeg * fnCost + fPos * fpCost,
    };
  }, [threshold, fnCost, fpCost]);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Decision Threshold: {threshold.toFixed(2)}</span>
          <input type="range" min={0.1} max={0.9} step={0.05} value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>Missed Fraud Cost (FN): ${fnCost}</span>
          <input type="range" min={20} max={500} step={10} value={fnCost} onChange={(e) => setFnCost(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>False Alarm Cost (FP): ${fpCost}</span>
          <input type="range" min={1} max={100} step={2} value={fpCost} onChange={(e) => setFpCost(+e.target.value)} />
        </label>
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">TP: {tp} | FP: {fp} | FN: {fn} | TN: {tn}</div>
        <div className="sim-metric">Precision: {(precision * 100).toFixed(1)}%</div>
        <div className="sim-metric">Recall: {(recall * 100).toFixed(1)}%</div>
        <div className="sim-metric">F1: {f1.toFixed(3)}</div>
        <div className="sim-metric" style={{ color: 'var(--accent-warm)' }}>
          Total Expected Error Cost: <strong>${totalCost.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

/* 6. Regularization & Bias-Variance */
export function RegularizationSim() {
  const [degree, setDegree] = useState(7);
  const [lambda, setLambda] = useState(0.05);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const points = useMemo(
    () => [
      [0.05, 0.25], [0.15, 0.65], [0.25, 0.92], [0.35, 0.72],
      [0.48, 0.12], [0.6, -0.58], [0.72, -0.88], [0.85, -0.75], [0.95, -0.15],
    ],
    []
  );

  // Solve Ridge polynomial fit on [0, 1]
  const { weights, trainMse, valMse } = useMemo(() => {
    const m = degree + 1;
    const A: number[][] = Array.from({ length: m }, () => Array(m).fill(0));
    const b: number[] = Array(m).fill(0);

    for (const [x, y] of points) {
      const phi = Array.from({ length: m }, (_, p) => Math.pow(x, p));
      for (let i = 0; i < m; i++) {
        b[i] += phi[i] * y;
        for (let j = 0; j < m; j++) A[i][j] += phi[i] * phi[j];
      }
    }
    for (let i = 1; i < m; i++) A[i][i] += lambda;

    // Gaussian elimination
    const aug = A.map((row, i) => [...row, b[i]]);
    for (let i = 0; i < m; i++) {
      let maxR = i;
      for (let r = i + 1; r < m; r++) if (Math.abs(aug[r][i]) > Math.abs(aug[maxR][i])) maxR = r;
      [aug[i], aug[maxR]] = [aug[maxR], aug[i]];
      const piv = aug[i][i] || 1e-8;
      for (let j = i; j <= m; j++) aug[i][j] /= piv;
      for (let r = 0; r < m; r++) {
        if (r === i) continue;
        const f = aug[r][i];
        for (let j = i; j <= m; j++) aug[r][j] -= f * aug[i][j];
      }
    }
    const w = aug.map((r) => r[m]);
    const evalPoly = (x: number) => w.reduce((acc, wi, p) => acc + wi * Math.pow(x, p), 0);

    const trErr = points.reduce((acc, [x, y]) => acc + Math.pow(evalPoly(x) - y, 2), 0) / points.length;
    let vErr = 0;
    for (let k = 0; k < 20; k++) {
      const x = 0.03 + (k / 19) * 0.94;
      const trueY = Math.sin(x * Math.PI * 2);
      vErr += Math.pow(evalPoly(x) - trueY, 2);
    }
    return { weights: w, trainMse: trErr, valMse: vErr / 20 };
  }, [degree, lambda, points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const toPx = (x: number, y: number): [number, number] => [40 + x * (w - 80), h / 2 - y * 85];

    // True sine wave
    ctx.strokeStyle = 'rgba(128,128,128,0.45)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let x = 0; x <= 1; x += 0.01) {
      const [px, py] = toPx(x, Math.sin(x * Math.PI * 2));
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Fitted curve
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let x = 0; x <= 1; x += 0.01) {
      const y = weights.reduce((acc, wi, p) => acc + wi * Math.pow(x, p), 0);
      const [px, py] = toPx(x, Math.max(-1.6, Math.min(1.6, y)));
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Data points
    ctx.fillStyle = '#c84b31';
    for (const [x, y] of points) {
      const [px, py] = toPx(x, y);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [points, weights]);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Polynomial Degree: {degree}</span>
          <input type="range" min={1} max={10} step={1} value={degree} onChange={(e) => setDegree(+e.target.value)} />
        </label>
        <label className="sim-control">
          <span>L2 Ridge λ: {lambda.toFixed(3)}</span>
          <input type="range" min={0} max={0.4} step={0.005} value={lambda} onChange={(e) => setLambda(+e.target.value)} />
        </label>
      </div>
      <div className="sim-canvas-wrap">
        <canvas ref={canvasRef} width={640} height={240} style={{ width: '100%', display: 'block' }} />
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">Train MSE: {trainMse.toFixed(4)}</div>
        <div className="sim-metric">True Signal Validation MSE: <strong>{valMse.toFixed(4)}</strong></div>
        <div className="sim-metric">
          Regime: {degree <= 2 ? 'High Bias (Underfitting)' : lambda === 0 && degree >= 7 ? 'High Variance (Overfitting)' : 'Balanced'}
        </div>
      </div>
    </div>
  );
}

/* 7. K-Means Interactive Clustering */
export function KMeansSim() {
  const [k, setK] = useState(3);
  const [points, setPoints] = useState<Array<{ x: number; y: number; c: number }>>(() =>
    Array.from({ length: 42 }, (_, i) => {
      const blob = i % 3;
      const cx = blob === 0 ? 0.25 : blob === 1 ? 0.72 : 0.5;
      const cy = blob === 0 ? 0.35 : blob === 1 ? 0.3 : 0.75;
      return {
        x: Math.max(0.06, Math.min(0.94, cx + (Math.sin(i * 7.3) * 0.14))),
        y: Math.max(0.06, Math.min(0.94, cy + (Math.cos(i * 5.1) * 0.14))),
        c: 0,
      };
    })
  );
  const [centroids, setCentroids] = useState<Array<{ x: number; y: number }>>([
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.25 },
    { x: 0.5, y: 0.8 },
    { x: 0.5, y: 0.5 },
  ]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const palette = ['#0f766e', '#c84b31', '#1d4ed8', '#b45309'];

  const stepKMeans = () => {
    const active = centroids.slice(0, k);
    const assigned = points.map((p) => {
      let best = 0;
      let bestD = Infinity;
      active.forEach((c, idx) => {
        const d = Math.hypot(p.x - c.x, p.y - c.y);
        if (d < bestD) {
          bestD = d;
          best = idx;
        }
      });
      return { ...p, c: best };
    });
    const nextCentroids = active.map((c, idx) => {
      const mine = assigned.filter((p) => p.c === idx);
      if (mine.length === 0) return c;
      return {
        x: mine.reduce((s, p) => s + p.x, 0) / mine.length,
        y: mine.reduce((s, p) => s + p.y, 0) / mine.length,
      };
    });
    setPoints(assigned);
    setCentroids([...nextCentroids, ...centroids.slice(k)]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    points.forEach((p) => {
      ctx.fillStyle = palette[p.c % k];
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    centroids.slice(0, k).forEach((c, idx) => {
      ctx.strokeStyle = '#15181a';
      ctx.fillStyle = palette[idx];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.x * w, c.y * h, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, centroids, k]);

  const inertia = points.reduce((sum, p) => {
    const c = centroids[p.c % k];
    return sum + Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
  }, 0);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Clusters K: {k}</span>
          <input type="range" min={2} max={4} step={1} value={k} onChange={(e) => setK(+e.target.value)} />
        </label>
        <button type="button" className="btn btn-primary btn-sm" onClick={stepKMeans}>
          <StepForward size={13} /> Step Assign & Update
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() =>
            setCentroids([
              { x: 0.15, y: 0.85 },
              { x: 0.85, y: 0.8 },
              { x: 0.5, y: 0.15 },
              { x: 0.5, y: 0.5 },
            ])
          }
        >
          <RotateCcw size={13} /> Reset Centroids
        </button>
      </div>
      <div className="sim-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={640}
          height={240}
          style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setPoints((prev) => [...prev, { x, y, c: 0 }]);
          }}
        />
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">Points: {points.length} (click canvas to add points)</div>
        <div className="sim-metric">Inertia (WCSS): {inertia.toFixed(3)}</div>
      </div>
    </div>
  );
}

/* 8. Live 2-Layer Neural Network Decision Boundary Playground */
export function NeuralNetSim() {
  const [dataset, setDataset] = useState<'xor' | 'circle'>('xor');
  const [activation, setActivation] = useState<'relu' | 'linear'>('relu');
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0.69);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const netRef = useRef({
    W1: [
      [1.4, -1.3, 1.1, -1.2, 0.8, -0.9],
      [-1.2, 1.4, 1.0, -1.1, 1.1, 0.7],
    ],
    b1: [0.1, -0.1, 0.2, -0.2, 0.0, 0.1],
    W2: [1.2, 1.1, -1.0, 0.9, -0.8, 0.7],
    b2: 0.0,
  });

  const data = useMemo(() => {
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i < 40; i++) {
      const x = ((i * 37) % 100) / 50 - 1;
      const y = ((i * 73) % 100) / 50 - 1;
      const label = dataset === 'xor' ? (x * y > 0 ? 1 : 0) : x * x + y * y < 0.45 ? 1 : 0;
      pts.push([x, y, label]);
    }
    return pts;
  }, [dataset]);

  const act = (z: number) => (activation === 'relu' ? Math.max(0, z) : z);
  const dAct = (z: number) => (activation === 'relu' ? (z > 0 ? 1 : 0) : 1);
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));

  const predict = (x: number, y: number) => {
    const { W1, b1, W2, b2 } = netRef.current;
    let sum = b2;
    for (let h = 0; h < 6; h++) {
      sum += act(x * W1[0][h] + y * W1[1][h] + b1[h]) * W2[h];
    }
    return sigmoid(sum);
  };

  const trainSteps = (steps: number) => {
    const lr = 0.25;
    let totalLoss = 0;
    for (let s = 0; s < steps; s++) {
      const { W1, b1, W2, b2 } = netRef.current;
      const dW1 = [Array(6).fill(0), Array(6).fill(0)];
      const db1 = Array(6).fill(0);
      const dW2 = Array(6).fill(0);
      let db2 = 0;
      totalLoss = 0;

      for (const [x, y, target] of data) {
        const z1 = Array.from({ length: 6 }, (_, h) => x * W1[0][h] + y * W1[1][h] + b1[h]);
        const h1 = z1.map(act);
        const out = sigmoid(h1.reduce((acc, v, i) => acc + v * W2[i], b2));
        totalLoss += -(target * Math.log(out + 1e-7) + (1 - target) * Math.log(1 - out + 1e-7));
        const dz2 = (out - target) / data.length;
        db2 += dz2;
        for (let h = 0; h < 6; h++) {
          dW2[h] += h1[h] * dz2;
          const dz1 = dz2 * W2[h] * dAct(z1[h]);
          db1[h] += dz1;
          dW1[0][h] += x * dz1;
          dW1[1][h] += y * dz1;
        }
      }

      netRef.current.b2 -= lr * db2;
      for (let h = 0; h < 6; h++) {
        netRef.current.W2[h] -= lr * dW2[h];
        netRef.current.b1[h] -= lr * db1[h];
        netRef.current.W1[0][h] -= lr * dW1[0][h];
        netRef.current.W1[1][h] -= lr * dW1[1][h];
      }
    }
    setEpoch((e) => e + steps);
    setLoss(totalLoss / data.length);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const res = 24;
    const cw = w / res;
    const ch = h / res;
    for (let gx = 0; gx < res; gx++) {
      for (let gy = 0; gy < res; gy++) {
        const x = (gx / res) * 2 - 1;
        const y = 1 - (gy / res) * 2;
        const p = predict(x, y);
        ctx.fillStyle = p > 0.5 ? `rgba(15, 118, 110, ${(p - 0.5) * 0.7})` : `rgba(200, 75, 49, ${(0.5 - p) * 0.7})`;
        ctx.fillRect(gx * cw, gy * ch, cw + 1, ch + 1);
      }
    }
    for (const [x, y, label] of data) {
      const px = ((x + 1) / 2) * w;
      const py = ((1 - y) / 2) * h;
      ctx.fillStyle = label === 1 ? '#0f766e' : '#c84b31';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch, dataset, activation]);

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>Dataset</span>
          <select className="input" value={dataset} onChange={(e) => setDataset(e.target.value as 'xor' | 'circle')}>
            <option value="xor">XOR Quadrants</option>
            <option value="circle">Inner Circle</option>
          </select>
        </label>
        <label className="sim-control">
          <span>Hidden Activation</span>
          <select className="input" value={activation} onChange={(e) => setActivation(e.target.value as 'relu' | 'linear')}>
            <option value="relu">ReLU (Non-Linear)</option>
            <option value="linear">Linear (No Activation!)</option>
          </select>
        </label>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => trainSteps(80)}>
          <Play size={13} /> Train +80 Epochs
        </button>
      </div>
      <div className="sim-canvas-wrap">
        <canvas ref={canvasRef} width={520} height={240} style={{ width: '100%', display: 'block' }} />
      </div>
      <div className="sim-metrics">
        <div className="sim-metric">Epochs: {epoch}</div>
        <div className="sim-metric">BCE Loss: <strong>{loss.toFixed(4)}</strong></div>
        <div className="sim-metric">
          {activation === 'linear' ? 'Notice linear cannot curve to solve XOR/Circle!' : 'ReLU bends hidden space cleanly'}
        </div>
      </div>
    </div>
  );
}

/* 9. 2D Convolution Kernel Explorer */
export function ConvKernelSim() {
  const [preset, setPreset] = useState<'edge' | 'sharpen' | 'blur'>('edge');
  const kernels: Record<string, number[][]> = {
    edge: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  };
  const grid = [
    [10, 10, 10, 90, 90, 90],
    [10, 10, 10, 90, 90, 90],
    [10, 10, 10, 90, 90, 90],
    [10, 10, 10, 90, 90, 90],
    [10, 10, 10, 10, 10, 10],
    [10, 10, 10, 10, 10, 10],
  ];
  const k = kernels[preset];
  const output = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => {
      let s = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) s += grid[r + kr][c + kc] * k[kr][kc];
      }
      return preset === 'blur' ? Math.round(s / 9) : s;
    })
  );

  return (
    <div>
      <div className="sim-controls">
        <label className="sim-control">
          <span>3×3 Kernel Filter</span>
          <select className="input" value={preset} onChange={(e) => setPreset(e.target.value as 'edge' | 'sharpen' | 'blur')}>
            <option value="edge">Laplacian Edge Detector</option>
            <option value="sharpen">Sharpen Filter</option>
            <option value="blur">Box Blur (÷9)</option>
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
        <div>
          <div className="mono" style={{ fontSize: '0.75rem', marginBottom: 6 }}>Input 6×6 Image</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 32px)', gap: 2 }}>
            {grid.flat().map((v, idx) => (
              <div
                key={idx}
                className="mono"
                style={{
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.7rem',
                  background: `rgba(15, 118, 110, ${v / 110})`,
                  color: v > 50 ? '#fff' : 'var(--ink)',
                  borderRadius: 4,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
        <div className="mono" style={{ fontSize: '1.2rem' }}>∗</div>
        <div>
          <div className="mono" style={{ fontSize: '0.75rem', marginBottom: 6 }}>3×3 Kernel</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gap: 3 }}>
            {k.flat().map((v, idx) => (
              <div
                key={idx}
                className="mono"
                style={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.75rem',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
        <div className="mono" style={{ fontSize: '1.2rem' }}>=</div>
        <div>
          <div className="mono" style={{ fontSize: '0.75rem', marginBottom: 6 }}>Output Feature Map (4×4)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 42px)', gap: 3 }}>
            {output.flat().map((v, idx) => (
              <div
                key={idx}
                className="mono"
                style={{
                  width: 42,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.72rem',
                  background: Math.abs(v) > 80 ? 'var(--accent-warm-soft)' : 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontWeight: Math.abs(v) > 80 ? 700 : 400,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
