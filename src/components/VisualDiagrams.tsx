'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { DiagramId } from '@/types/course';
import { RichText } from './MathAndProse';

function DiagramSvg({ diagramId }: { diagramId: DiagramId }) {
  switch (diagramId) {
    case 'python-blocks':
      return (
        <svg viewBox="0 0 760 230" className="diagram-svg" role="img" aria-label="Python 4 core building blocks diagram">
          <defs>
            <marker id="arr-py" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* 1. Variable & Type */}
          <rect x="16" y="34" width="155" height="156" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="93" y="60" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">1. VAR &amp; TYPES</text>
          <rect x="34" y="76" width="118" height="44" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="93" y="103" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="monospace">threshold = 0.8</text>
          <text x="93" y="152" textAnchor="middle" fill="var(--ink-2)" fontSize="11">int, float, str, bool</text>
          <text x="93" y="168" textAnchor="middle" fill="var(--ink-2)" fontSize="11">stored in named boxes</text>

          <line x1="173" y1="112" x2="199" y2="112" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-py)" />

          {/* 2. Ordered Lists */}
          <rect x="203" y="34" width="168" height="156" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="287" y="60" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">2. ORDERED LISTS</text>
          <rect x="219" y="76" width="136" height="28" rx="6" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="1.2" />
          <text x="287" y="94" textAnchor="middle" fill="var(--ink)" fontSize="11" fontFamily="monospace">[0.45, 0.82, 0.91]</text>
          <rect x="219" y="110" width="136" height="28" rx="6" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="1.2" />
          <text x="287" y="128" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontFamily="monospace">scores[0] -&gt; 0.45</text>
          <text x="287" y="160" textAnchor="middle" fill="var(--ink-2)" fontSize="11">Hold many values in</text>
          <text x="287" y="176" textAnchor="middle" fill="var(--ink-2)" fontSize="11">sequence for processing</text>

          <line x1="373" y1="112" x2="399" y2="112" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-py)" />

          {/* 3. Loop */}
          <rect x="403" y="34" width="155" height="156" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="480" y="60" textAnchor="middle" fill="var(--accent-warm)" fontSize="11" fontWeight="700" fontFamily="monospace">3. FOR LOOP</text>
          <rect x="421" y="78" width="118" height="44" rx="8" fill="var(--surface)" stroke="var(--accent-warm)" strokeWidth="1.5" />
          <text x="480" y="104" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="700" fontFamily="monospace">for s in scores:</text>
          <path d="M518,128 C536,144 430,144 445,126" fill="none" stroke="var(--accent-warm)" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="480" y="164" textAnchor="middle" fill="var(--ink-2)" fontSize="11">Repeats cleanly on</text>
          <text x="480" y="180" textAnchor="middle" fill="var(--ink-2)" fontSize="11">every item 1-by-1</text>

          <line x1="560" y1="112" x2="586" y2="112" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-py)" />

          {/* 4. Decision */}
          <rect x="590" y="34" width="154" height="156" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="667" y="60" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">4. IF / OUTPUT</text>
          <rect x="606" y="76" width="122" height="36" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.2" />
          <text x="667" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="700" fontFamily="monospace">if s &gt;= threshold:</text>
          <rect x="618" y="122" width="98" height="26" rx="6" fill="var(--success-soft)" stroke="var(--success)" />
          <text x="667" y="139" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">kept = [0.82, 0.91]</text>
          <text x="667" y="172" textAnchor="middle" fill="var(--ink-2)" fontSize="11">Filters &amp; acts safely</text>
        </svg>
      );

    case 'ml-pipeline':
      return (
        <svg viewBox="0 0 760 235" className="diagram-svg" role="img" aria-label="Leak-free Machine Learning Pipeline architecture">
          <defs>
            <marker id="arr-ml" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* SQL & Raw */}
          <rect x="14" y="42" width="136" height="145" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="82" y="68" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">RAW SQL / CSV</text>
          <text x="82" y="95" textAnchor="middle" fill="var(--ink)" fontSize="11.5">Transactions + Logs</text>
          <text x="82" y="116" textAnchor="middle" fill="var(--danger)" fontSize="10.5" fontWeight="700">Drop post-event</text>
          <text x="82" y="131" textAnchor="middle" fill="var(--danger)" fontSize="10.5" fontWeight="700">leakage columns!</text>
          <text x="82" y="164" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">Time-ordered split</text>

          <line x1="152" y1="115" x2="176" y2="115" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ml)" />

          {/* Split Firewall */}
          <rect x="180" y="28" width="150" height="175" rx="10" fill="var(--accent-warm-soft)" stroke="var(--accent-warm)" strokeWidth="1.8" />
          <text x="255" y="54" textAnchor="middle" fill="var(--accent-warm)" fontSize="11" fontWeight="700" fontFamily="monospace">SPLIT FIREWALL</text>
          <rect x="196" y="68" width="118" height="52" rx="7" fill="var(--surface)" stroke="var(--accent)" />
          <text x="255" y="90" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="700">TRAIN FOLD (80%)</text>
          <text x="255" y="108" textAnchor="middle" fill="var(--accent)" fontSize="10" fontFamily="monospace">.fit_transform()</text>
          <rect x="196" y="132" width="118" height="52" rx="7" fill="var(--surface)" stroke="var(--border-strong)" />
          <text x="255" y="154" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="700">TEST FOLD (20%)</text>
          <text x="255" y="172" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">.transform() ONLY</text>

          <line x1="332" y1="115" x2="356" y2="115" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ml)" />

          {/* ColumnTransformer */}
          <rect x="360" y="42" width="174" height="145" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="447" y="66" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">sklearn.Pipeline</text>
          <rect x="374" y="80" width="146" height="38" rx="6" fill="var(--surface)" stroke="var(--border)" />
          <text x="447" y="97" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="600">Num: Median + Scale</text>
          <text x="447" y="111" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5" fontFamily="monospace">SimpleImputer + Scaler</text>
          <rect x="374" y="126" width="146" height="38" rx="6" fill="var(--surface)" stroke="var(--border)" />
          <text x="447" y="143" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="600">Cat: Impute + OneHot</text>
          <text x="447" y="157" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5" fontFamily="monospace">handle_unknown=ignore</text>

          <line x1="536" y1="115" x2="560" y2="115" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ml)" />

          {/* Model & ROI */}
          <rect x="564" y="42" width="182" height="145" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
          <text x="655" y="68" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">XGBoost + EVAL ROI</text>
          <text x="655" y="96" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="700">PR-AUC &amp; Thresholding</text>
          <text x="655" y="118" textAnchor="middle" fill="var(--ink-2)" fontSize="11">SHAP Feature Drivers</text>
          <rect x="580" y="132" width="150" height="36" rx="6" fill="var(--surface)" stroke="var(--success)" />
          <text x="655" y="154" textAnchor="middle" fill="var(--success)" fontSize="10.5" fontWeight="700">A/B Test Lift Verified</text>
        </svg>
      );

    case 'neural-backprop':
      return (
        <svg viewBox="0 0 760 235" className="diagram-svg" role="img" aria-label="Forward pass and backpropagation gradient flow">
          <defs>
            <marker id="arr-fwd" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
            <marker id="arr-bwd" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent-warm)" />
            </marker>
          </defs>
          <text x="380" y="24" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">
            FORWARD PASS: DATA → PREDICTIONS ───►
          </text>

          {/* Input Layer */}
          <circle cx="90" cy="76" r="18" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="2" />
          <circle cx="90" cy="136" r="18" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="2" />
          <text x="90" y="80" textAnchor="middle" fill="var(--ink)" fontSize="11" fontFamily="monospace">x₁</text>
          <text x="90" y="140" textAnchor="middle" fill="var(--ink)" fontSize="11" fontFamily="monospace">x₂</text>
          <text x="90" y="175" textAnchor="middle" fill="var(--ink-muted)" fontSize="11">Inputs</text>

          {/* Connections */}
          <line x1="108" y1="76" x2="230" y2="66" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="108" y1="76" x2="230" y2="106" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="108" y1="76" x2="230" y2="146" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="108" y1="136" x2="230" y2="66" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="108" y1="136" x2="230" y2="106" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="108" y1="136" x2="230" y2="146" stroke="var(--border-strong)" strokeWidth="1.5" />

          {/* Hidden Layer */}
          <circle cx="250" cy="66" r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="250" cy="106" r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="250" cy="146" r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
          <text x="250" y="70" textAnchor="middle" fill="var(--ink)" fontSize="10" fontFamily="monospace">h₁</text>
          <text x="250" y="110" textAnchor="middle" fill="var(--ink)" fontSize="10" fontFamily="monospace">h₂</text>
          <text x="250" y="150" textAnchor="middle" fill="var(--ink)" fontSize="10" fontFamily="monospace">h₃</text>
          <text x="250" y="182" textAnchor="middle" fill="var(--ink-muted)" fontSize="11">Linear + ReLU/GELU</text>

          <line x1="272" y1="106" x2="374" y2="106" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-fwd)" />

          {/* Prediction */}
          <rect x="380" y="76" width="128" height="60" rx="10" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
          <text x="444" y="102" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="700">Prediction ŷ</text>
          <text x="444" y="122" textAnchor="middle" fill="var(--ink-muted)" fontSize="10.5" fontFamily="monospace">Softmax Prob</text>

          <line x1="510" y1="106" x2="554" y2="106" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-fwd)" />

          {/* Loss Box */}
          <rect x="560" y="66" width="180" height="80" rx="10" fill="var(--accent-warm-soft)" stroke="var(--accent-warm)" strokeWidth="2" />
          <text x="650" y="94" textAnchor="middle" fill="var(--accent-warm)" fontSize="11.5" fontWeight="700" fontFamily="monospace">LOSS = Error(ŷ, y)</text>
          <text x="650" y="114" textAnchor="middle" fill="var(--ink-2)" fontSize="11">How far off were we?</text>
          <text x="650" y="132" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">∂Loss/∂W via Chain Rule</text>

          {/* Backprop Arrow */}
          <path d="M620,158 C510,208 260,208 145,165" fill="none" stroke="var(--accent-warm)" strokeWidth="2.2" strokeDasharray="6,4" markerEnd="url(#arr-bwd)" />
          <text x="385" y="218" textAnchor="middle" fill="var(--accent-warm)" fontSize="11" fontWeight="700" fontFamily="monospace">
            ◄─── BACKPROP (AdamW): Nudge every weight W to shrink error
          </text>
        </svg>
      );

    case 'transformer-attention':
      return (
        <svg viewBox="0 0 760 240" className="diagram-svg" role="img" aria-label="Transformer Self-Attention and KV Cache diagram">
          <defs>
            <marker id="arr-tr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* Tokens */}
          <rect x="16" y="42" width="136" height="156" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" />
          <text x="84" y="66" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">1. BPE + RoPE</text>
          <rect x="30" y="80" width="108" height="26" rx="5" fill="var(--surface)" stroke="var(--border)" />
          <text x="84" y="97" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontFamily="monospace">&quot;The&quot; → [0.2, ...]</text>
          <rect x="30" y="112" width="108" height="26" rx="5" fill="var(--surface)" stroke="var(--border)" />
          <text x="84" y="129" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontFamily="monospace">&quot;cat&quot; → [0.9, ...]</text>
          <rect x="30" y="144" width="108" height="26" rx="5" fill="var(--surface)" stroke="var(--border)" />
          <text x="84" y="161" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontFamily="monospace">&quot;sat&quot; → [-0.4, ...]</text>

          <line x1="154" y1="120" x2="178" y2="120" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-tr)" />

          {/* Q K V */}
          <rect x="182" y="34" width="234" height="172" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="299" y="58" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">2. CAUSAL SELF-ATTENTION</text>
          <rect x="196" y="72" width="60" height="32" rx="6" fill="var(--surface)" stroke="var(--accent)" />
          <text x="226" y="92" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700" fontFamily="monospace">Q (Ask)</text>
          <rect x="268" y="72" width="62" height="32" rx="6" fill="var(--surface)" stroke="var(--cobalt)" />
          <text x="299" y="92" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700" fontFamily="monospace">K (Tag)</text>
          <rect x="342" y="72" width="62" height="32" rx="6" fill="var(--surface)" stroke="var(--accent-warm)" />
          <text x="373" y="92" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700" fontFamily="monospace">V (Info)</text>
          <text x="299" y="130" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700" fontFamily="monospace">softmax((QKᵀ / √d) + Mask) · V</text>
          <rect x="204" y="146" width="190" height="44" rx="7" fill="var(--surface)" stroke="var(--border-strong)" />
          <text x="299" y="165" textAnchor="middle" fill="var(--accent-warm)" fontSize="10.5" fontWeight="700">KV Cache saves past K &amp; V</text>
          <text x="299" y="180" textAnchor="middle" fill="var(--ink-muted)" fontSize="10">No recomputing prior tokens!</text>

          <line x1="418" y1="120" x2="442" y2="120" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-tr)" />

          {/* MLP + MoE */}
          <rect x="446" y="42" width="136" height="156" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" />
          <text x="514" y="68" textAnchor="middle" fill="var(--accent-warm)" fontSize="11" fontWeight="700" fontFamily="monospace">3. FFN / MoE</text>
          <text x="514" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="600">RMSNorm + Residual</text>
          <text x="514" y="122" textAnchor="middle" fill="var(--ink-2)" fontSize="11">SwiGLU Knowledge</text>
          <text x="514" y="142" textAnchor="middle" fill="var(--ink-2)" fontSize="11">Lookup Layers</text>
          <text x="514" y="172" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">×32 to ×80 blocks</text>

          <line x1="584" y1="120" x2="608" y2="120" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-tr)" />

          {/* Output */}
          <rect x="612" y="42" width="134" height="156" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
          <text x="679" y="68" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">4. NEXT TOKEN</text>
          <text x="679" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="700">Logits → Softmax</text>
          <text x="679" y="120" textAnchor="middle" fill="var(--ink-2)" fontSize="11">Temp + Top-p sample</text>
          <rect x="626" y="138" width="106" height="36" rx="6" fill="var(--surface)" stroke="var(--success)" />
          <text x="679" y="160" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">→ &quot;on&quot; (74%)</text>
        </svg>
      );

    case 'hybrid-rag':
      return (
        <svg viewBox="0 0 760 245" className="diagram-svg" role="img" aria-label="Production Multi-Tenant Hybrid RAG architecture">
          <defs>
            <marker id="arr-rag" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* User + ACL */}
          <rect x="14" y="46" width="136" height="152" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" />
          <text x="82" y="70" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">1. QUERY + ACL</text>
          <text x="82" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="600">&quot;Refund policy?&quot;</text>
          <rect x="26" y="114" width="112" height="44" rx="7" fill="var(--accent-warm-soft)" stroke="var(--accent-warm)" />
          <text x="82" y="133" textAnchor="middle" fill="var(--accent-warm)" fontSize="10" fontWeight="700" fontFamily="monospace">MANDATORY FILTER</text>
          <text x="82" y="149" textAnchor="middle" fill="var(--ink)" fontSize="10" fontFamily="monospace">tenant_id = &quot;acme&quot;</text>
          <text x="82" y="180" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5">Zero cross-tenant leak</text>

          <line x1="152" y1="90" x2="180" y2="75" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-rag)" />
          <line x1="152" y1="154" x2="180" y2="168" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-rag)" />

          {/* Dual Retrieval */}
          <rect x="184" y="34" width="150" height="78" rx="10" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="1.5" />
          <text x="259" y="58" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">2A. DENSE VECTORS</text>
          <text x="259" y="78" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Meaning / Synonyms</text>
          <text x="259" y="96" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">pgvector / HNSW</text>

          <rect x="184" y="132" width="150" height="78" rx="10" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="259" y="156" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">2B. BM25 KEYWORD</text>
          <text x="259" y="176" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Exact IDs / Error Codes</text>
          <text x="259" y="194" textAnchor="middle" fill="var(--ink-muted)" fontSize="10" fontFamily="monospace">SKU-409, RFC-19</text>

          <line x1="336" y1="73" x2="366" y2="108" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-rag)" />
          <line x1="336" y1="171" x2="366" y2="134" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-rag)" />

          {/* RRF + Reranker */}
          <rect x="370" y="46" width="166" height="152" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="453" y="72" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">3. FUSE &amp; RERANK</text>
          <rect x="384" y="86" width="138" height="42" rx="6" fill="var(--surface)" stroke="var(--border)" />
          <text x="453" y="104" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="700">RRF Rank Merge</text>
          <text x="453" y="119" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5" fontFamily="monospace">Top-50 candidates</text>
          <rect x="384" y="138" width="138" height="44" rx="6" fill="var(--surface)" stroke="var(--accent)" />
          <text x="453" y="157" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="700">Cross-Encoder Rerank</text>
          <text x="453" y="172" textAnchor="middle" fill="var(--accent)" fontSize="9.5" fontFamily="monospace">Top-5 sharpest chunks</text>

          <line x1="538" y1="122" x2="564" y2="122" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-rag)" />

          {/* Grounded Generator + Eval */}
          <rect x="568" y="46" width="178" height="152" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
          <text x="657" y="72" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">4. GROUNDED ANSWER</text>
          <text x="657" y="100" textAnchor="middle" fill="var(--ink)" fontSize="11.5" fontWeight="700">Cited Answer [doc_12]</text>
          <text x="657" y="122" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">&quot;I don&apos;t know&quot; if missing</text>
          <rect x="582" y="140" width="150" height="42" rx="6" fill="var(--surface)" stroke="var(--success)" />
          <text x="657" y="159" textAnchor="middle" fill="var(--success)" fontSize="10" fontWeight="700" fontFamily="monospace">CI EVAL GATE</text>
          <text x="657" y="174" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5">Recall@5 &amp; Faithfulness</text>
        </svg>
      );

    case 'agent-guardrails':
      return (
        <svg viewBox="0 0 760 240" className="diagram-svg" role="img" aria-label="Production Sandboxed Agent and Guardrails loop">
          <defs>
            <marker id="arr-ag" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* Shield */}
          <rect x="14" y="44" width="150" height="148" rx="10" fill="var(--accent-warm-soft)" stroke="var(--accent-warm)" strokeWidth="1.5" />
          <text x="89" y="70" textAnchor="middle" fill="var(--accent-warm)" fontSize="11" fontWeight="700" fontFamily="monospace">1. INPUT SHIELD</text>
          <text x="89" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="600">Untrusted User / Docs</text>
          <text x="89" y="120" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Wrap in XML delimiters</text>
          <text x="89" y="140" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Redact PII &amp; Secrets</text>
          <text x="89" y="168" textAnchor="middle" fill="var(--accent-warm)" fontSize="10" fontFamily="monospace">Block injection attempts</text>

          <line x1="166" y1="118" x2="192" y2="118" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ag)" />

          {/* Router + Planner */}
          <rect x="196" y="44" width="166" height="148" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="279" y="70" textAnchor="middle" fill="var(--cobalt)" fontSize="11" fontWeight="700" fontFamily="monospace">2. ROUTER + PLANNER</text>
          <rect x="210" y="84" width="138" height="38" rx="6" fill="var(--surface)" stroke="var(--cobalt)" />
          <text x="279" y="101" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="700">Cache / 8B Router</text>
          <text x="279" y="115" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5">75% cheap fast path</text>
          <rect x="210" y="132" width="138" height="44" rx="6" fill="var(--surface)" stroke="var(--border)" />
          <text x="279" y="151" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="700">Bounded Step Loop</text>
          <text x="279" y="166" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5" fontFamily="monospace">max_steps = 5, timeout</text>

          <line x1="364" y1="118" x2="390" y2="118" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ag)" />

          {/* Validator + HITL */}
          <rect x="394" y="44" width="176" height="148" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="482" y="70" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="monospace">3. SCHEMA &amp; HITL GATE</text>
          <rect x="408" y="84" width="148" height="38" rx="6" fill="var(--surface)" stroke="var(--accent)" />
          <text x="482" y="101" textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="700">Pydantic Arg Check</text>
          <text x="482" y="115" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5">Allowlisted Tools Only</text>
          <rect x="408" y="132" width="148" height="44" rx="6" fill="var(--warning-soft)" stroke="var(--warning)" />
          <text x="482" y="151" textAnchor="middle" fill="var(--warning)" fontSize="10.5" fontWeight="700">Human Approval Gate</text>
          <text x="482" y="166" textAnchor="middle" fill="var(--ink-2)" fontSize="9.5">Required for writes / $$$ </text>

          <line x1="572" y1="118" x2="598" y2="118" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-ag)" />

          {/* Sandbox & Trace */}
          <rect x="602" y="44" width="144" height="148" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
          <text x="674" y="70" textAnchor="middle" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="monospace">4. SANDBOX &amp; TRACE</text>
          <text x="674" y="98" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700">Execute Safely</text>
          <text x="674" y="120" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Log Latency &amp; Cost</text>
          <text x="674" y="142" textAnchor="middle" fill="var(--ink-2)" fontSize="10.5">Monitor Drift Alerts</text>
          <text x="674" y="170" textAnchor="middle" fill="var(--success)" fontSize="10" fontWeight="700" fontFamily="monospace">✓ Verified Audit Log</text>
        </svg>
      );
  }
}

export function VisualDiagramBlock({
  diagramId,
  title,
  caption,
}: {
  diagramId: DiagramId;
  title: string;
  caption: string;
}) {
  return (
    <section className="block lab-card">
      <div className="lab-header">
        <div>
          <span className="lab-badge">
            <ImageIcon size={12} style={{ display: 'inline', marginRight: 5 }} />
            Visual Architecture Illustration
          </span>
          <h3 style={{ fontSize: '1.08rem', marginTop: 2 }}>{title}</h3>
        </div>
      </div>
      <div className="lab-body">
        <div className="diagram-wrap">
          <DiagramSvg diagramId={diagramId} />
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', marginTop: 10 }}>
          <RichText text={caption} />
        </p>
      </div>
    </section>
  );
}
