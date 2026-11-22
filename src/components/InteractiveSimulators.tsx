'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import type { SimulatorId } from '@/types/course';
import { RichText } from './MathAndProse';
import {
  AbTestSim,
  BayesEntropySim,
  ConvKernelSim,
  GradientDescentSim,
  KMeansSim,
  NeuralNetSim,
  RegularizationSim,
  RocThresholdSim,
  VectorSpaceSim,
} from './simulators/CoreSimulators';
import {
  AttentionMapSim,
  BpeTokenizerSim,
  CostCalculatorSim,
  DriftMonitorSim,
  LatencyEconomicsSim,
  LlmVramSim,
  LoraRankSim,
  PromptDefenseSim,
  ReactAgentSim,
  SamplingLabSim,
  VectorSearchSim,
} from './simulators/LlmSimulators';

export function InteractiveSimulatorCard({
  simulatorId,
  title,
  description,
}: {
  simulatorId: SimulatorId;
  title: string;
  description: string;
}) {
  const renderSim = () => {
    switch (simulatorId) {
      case 'vector-space':
        return <VectorSpaceSim />;
      case 'gradient-descent':
        return <GradientDescentSim />;
      case 'bayes-entropy':
        return <BayesEntropySim />;
      case 'ab-test':
        return <AbTestSim />;
      case 'roc-threshold':
        return <RocThresholdSim />;
      case 'regularization':
        return <RegularizationSim />;
      case 'kmeans':
        return <KMeansSim />;
      case 'neural-net':
        return <NeuralNetSim />;
      case 'conv-kernel':
        return <ConvKernelSim />;
      case 'bpe-tokenizer':
        return <BpeTokenizerSim />;
      case 'attention-map':
        return <AttentionMapSim />;
      case 'llm-vram':
        return <LlmVramSim />;
      case 'sampling-lab':
        return <SamplingLabSim />;
      case 'prompt-defense':
        return <PromptDefenseSim />;
      case 'vector-search':
        return <VectorSearchSim />;
      case 'lora-rank':
        return <LoraRankSim />;
      case 'react-agent':
        return <ReactAgentSim />;
      case 'latency-economics':
        return <LatencyEconomicsSim />;
      case 'cost-calculator':
        return <CostCalculatorSim />;
      case 'drift-monitor':
        return <DriftMonitorSim />;
    }
  };

  return (
    <div className="lab-card block" id={`sim-${simulatorId}`}>
      <div className="lab-header">
        <div>
          <span className="lab-badge">
            <Sliders size={12} style={{ display: 'inline', marginRight: 5 }} />
            Interactive Visual Simulator
          </span>
          <h3 style={{ fontSize: '1.08rem', marginTop: 2 }}>{title}</h3>
        </div>
      </div>
      <div className="lab-body">
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginBottom: 14 }}>
          <RichText text={description} />
        </p>
        {renderSim()}
      </div>
    </div>
  );
}
