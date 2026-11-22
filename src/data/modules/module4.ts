import type { CourseModule } from '@/types/course';

export const module4: CourseModule = {
  id: 'mod-4',
  number: 4,
  title: 'Deep Learning & Neural Architectures',
  subtitle: 'Backpropagation from scratch, activations, normalization, CNNs for vision, and why sequences needed Attention.',
  track: 'core',
  estimatedHours: 4,
  capstoneDeliverable: 'Code a working 2-layer neural network with backpropagation and ReLU in pure NumPy.',
  lessons: [
    {
      id: '4-1',
      moduleId: 'mod-4',
      number: '4.1',
      title: 'MLPs, Activations & Backpropagation From Scratch',
      subtitle: 'Demystify neural networks—stacking linear algebra + non-linear bends + the Chain Rule.',
      durationMinutes: 18,
      track: 'core',
      prerequisites: ['1.3', '3.1'],
      objectives: [
        'Prove why stacking linear layers without non-linear activation collapses to a single linear matrix.',
        'Compare ReLU, GELU, and SiLU/Swish and understand dying ReLUs.',
        'Trace forward and backward passes through a 2-layer MLP.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Why Non-Linearity Is Everything',
          paragraphs: [
            'If you stack two linear layers without an activation function: $W_2(W_1 x) = (W_2 W_1) x = W_{\\text{combined}} x$. A 100-layer linear network has the exact same expressive power as a **1-layer linear regression**! Inserting a simple non-linear bend like **ReLU** ($\\max(0, z)$) between layers turns the network into a universal function approximator capable of carving arbitrary curved boundaries (like XOR or spirals).',
            'Modern LLMs replace sharp ReLU with smooth **GELU** or **SwiGLU** ($\\text{SiLU}(xW_1) \\odot xW_2$), avoiding zero-gradient dead zones for negative inputs.',
          ],
        },
        {
          type: 'visual-diagram',
          diagramId: 'neural-backprop',
          title: 'Visual Architecture: Forward Pass Predictions & Backpropagation Gradients',
          caption: 'Data flows left-to-right to make a prediction, error is measured at Loss, and gradients flow backward to nudge every weight.',
        },
        {
          type: 'simulator',
          simulatorId: 'neural-net',
          title: 'Interactive Lab: Live Neural Network Decision Boundary Playground',
          description:
            'Train a real 2-layer neural network right in your browser on XOR, Circle, or Spiral datasets! Toggle activation (ReLU vs Tanh vs Linear) and hidden neurons to watch the decision boundary bend in real time.',
        },
        {
          type: 'python-lab',
          labId: 'lab-4-1',
          title: 'Lab 4.1: Backpropagation Through a 2-Layer ReLU MLP',
          prompt:
            'Complete the backward pass for a 2-layer MLP solving XOR (`h = relu(X @ W1 + b1)`, `out = sigmoid(h @ W2 + b2)`). Implement the gradients `dW2`, `db2`, `dW1`, `db1` inside `train_xor_step`.',
          starterCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def train_xor(steps: int = 2000, lr: float = 0.5):
    rng = np.random.default_rng(7)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    W1 = rng.normal(0, 0.8, (2, 6))
    b1 = np.zeros((1, 6))
    W2 = rng.normal(0, 0.8, (6, 1))
    b2 = np.zeros((1, 1))

    for _ in range(steps):
        # Forward
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = sigmoid(h @ W2 + b2)

        # Backward (BCE loss gradient wrt pre-sigmoid logits is out - y)
        dz2 = (out - y) / len(X)
        # TODO: compute dW2, db2, dh, dz1 (hint: dz1 = dh * (z1 > 0)), dW1, db1
        # and update W2, b2, W1, b1
        pass
    return sigmoid(np.maximum(0.0, X @ W1 + b1) @ W2 + b2)

print(np.round(train_xor(), 3))`,
          testCode: `import numpy as np
preds = train_xor(steps=3000, lr=0.5).ravel()
assert preds[0] < 0.1 and preds[3] < 0.1, f"(0,0) and (1,1) must be ~0, got {preds[[0,3]]}"
assert preds[1] > 0.9 and preds[2] > 0.9, f"(0,1) and (1,0) must be ~1, got {preds[[1,2]]}"
print("PASS: Pure-NumPy MLP solved non-linear XOR via backpropagation!")`,
          solutionCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def train_xor(steps: int = 2000, lr: float = 0.5):
    rng = np.random.default_rng(7)
    X = np.array([[0.,0.], [0.,1.], [1.,0.], [1.,1.]])
    y = np.array([[0.], [1.], [1.], [0.]])
    W1 = rng.normal(0, 0.8, (2, 6))
    b1 = np.zeros((1, 6))
    W2 = rng.normal(0, 0.8, (6, 1))
    b2 = np.zeros((1, 1))

    for _ in range(steps):
        z1 = X @ W1 + b1
        h = np.maximum(0.0, z1)
        out = sigmoid(h @ W2 + b2)

        dz2 = (out - y) / len(X)
        dW2 = h.T @ dz2
        db2 = dz2.sum(axis=0, keepdims=True)
        dh = dz2 @ W2.T
        dz1 = dh * (z1 > 0)
        dW1 = X.T @ dz1
        db1 = dz1.sum(axis=0, keepdims=True)

        W2 -= lr * dW2
        b2 -= lr * db2
        W1 -= lr * dW1
        b1 -= lr * db1
    return sigmoid(np.maximum(0.0, X @ W1 + b1) @ W2 + b2)`,
          hint: 'Matrix transpose reverses the forward shape: if `h @ W2` is `(4,6) @ (6,1)`, then `dW2 = h.T @ dz2` and `dh = dz2 @ W2.T`.',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q4-1-1',
          question: 'What happens if you initialize ALL weights of a multi-layer neural network to `0.0`?',
          options: [
            'The network converges twice as fast',
            'Symmetry problem: every neuron in a layer computes the exact same output and receives the exact same gradient forever',
            'ReLU turns into Sigmoid',
            'The learning rate becomes infinite',
          ],
          correctIndex: 1,
          explanation: 'Zero initialization breaks nothing; all hidden neurons stay identical copies of one another. Random Xavier/He initialization breaks symmetry.',
        },
        {
          id: 'q4-1-2',
          question: 'Without non-linear activation functions (ReLU/GELU/Tanh), a 50-layer MLP is mathematically equivalent to:',
          options: [
            'A Transformer',
            'A single linear matrix multiplication $W x + b$',
            'An XGBoost ensemble',
            'A Convolutional network',
          ],
          correctIndex: 1,
          explanation: 'Products of linear matrices collapse into one linear matrix; non-linearities are required to bend decision boundaries.',
        },
        {
          id: 'q4-1-3',
          question: 'What is the "Dying ReLU" problem?',
          options: [
            'When a neuron receives large negative inputs so $z < 0$ for all training samples, its ReLU gradient is 0 and its weights never update again',
            'When ReLU outputs exceed 1.0',
            'When batch size is too large',
            'When weights become integers',
          ],
          correctIndex: 0,
          explanation: 'ReLU has derivative 0 for $z \\le 0$. Smooth alternatives like GELU or LeakyReLU retain small non-zero gradients.',
        },
      ],
    },
    {
      id: '4-2',
      moduleId: 'mod-4',
      number: '4.2',
      title: 'Training Dynamics: Normalization, AdamW & Mixed Precision',
      subtitle: 'Why deep networks used to collapse—and the exact tricks (LayerNorm, Residuals, Warmup, BF16) that stabilized modern AI.',
      durationMinutes: 15,
      track: 'core',
      prerequisites: ['4.1'],
      objectives: [
        'Distinguish BatchNorm (vision/batch-dependent) vs LayerNorm & RMSNorm (Transformers/token-independent).',
        'Explain why Residual Skip Connections ($x + F(x)$) let us train 100+ layer networks.',
        'Understand AdamW decoupled weight decay, Cosine LR Warmup, and BF16 mixed precision.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'How Deep Networks Stopped Exploding',
          paragraphs: [
            'In deep networks, multiplying 50 Jacobians during backprop makes gradients either vanish to `0` or explode to `NaN`. Three breakthroughs solved this:',
            '1. **Residual Connections (`y = x + F(x)`)**: During backprop, the derivative of `x + F(x)` is `1 + dF/dx`. That `+ 1` creates an **unobstructed gradient highway** straight from the loss back to layer 1!',
            '2. **Normalization**: **BatchNorm** normalizes across the batch (bad for variable-length text and tiny LLM batch sizes). **LayerNorm** (and faster **RMSNorm** used in Llama/Qwen) normalizes each token vector independently across its feature dimension.',
            '3. **Warmup + Cosine Decay + AdamW**: Early random weights produce chaotic gradients; warming up the LR linearly for the first ~2–5% of steps prevents early divergence, followed by cosine decay.',
          ],
        },
        {
          type: 'table',
          title: 'Modern Deep Learning Training Precision (FP32 vs FP16 vs BF16)',
          headers: ['Format', 'Total Bits', 'Exponent (Range)', 'Mantissa (Precision)', 'Why It Matters'],
          rows: [
            ['`FP32`', '32', '8 bits', '23 bits', 'Full precision baseline; 4 bytes/param (slow & memory-heavy)'],
            ['`FP16`', '16', '5 bits', '10 bits', 'Narrow range (`max 65,504`) — overflows easily without loss scaling'],
            ['`BF16` (Brain Float)', '16', '8 bits (same as FP32!)', '7 bits', '**Industry default for LLM training**: 2x less VRAM, same dynamic range as FP32, no loss scaling needed'],
          ],
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'PyTorch Training Loop Anatomy (Memorize These 5 Lines)',
          body: '`optimizer.zero_grad()` (clear previous step gradients) $\\rightarrow$ `pred = model(x)` (forward) $\\rightarrow$ `loss = criterion(pred, y)` $\\rightarrow$ `loss.backward()` (autograd populates `.grad`) $\\rightarrow$ `torch.nn.utils.clip_grad_norm_(..., 1.0)` + `optimizer.step()`. Forgetting `zero_grad()` silently accumulates gradients across batches!',
        },
      ],
      quiz: [
        {
          id: 'q4-2-1',
          question: 'Why do Transformers and LLMs use LayerNorm / RMSNorm instead of BatchNorm?',
          options: [
            'BatchNorm only works on integer inputs',
            'LayerNorm/RMSNorm normalizes each token independently across features, so it works identically regardless of batch size (even batch=1 at inference) and sequence length',
            'LayerNorm uses 10x more parameters',
            'BatchNorm cannot be differentiated',
          ],
          correctIndex: 1,
          explanation: 'BatchNorm depends on batch statistics that become noisy with small batches and awkward with padded variable-length sequences.',
        },
        {
          id: 'q4-2-2',
          question: 'Why is `BF16` (bfloat16) preferred over `FP16` for training large neural networks?',
          options: [
            'BF16 uses 8 bits total instead of 16',
            'BF16 keeps the full 8-bit exponent of FP32, avoiding gradient overflow/underflow without needing dynamic loss scaling',
            'BF16 has higher decimal precision than FP32',
            'FP16 cannot run on GPUs',
          ],
          correctIndex: 1,
          explanation: 'Neural nets tolerate slightly lower mantissa precision well, but desperately need wide dynamic range so small gradients do not underflow or large activations overflow.',
        },
        {
          id: 'q4-2-3',
          question: 'How do Residual Skip Connections (`x + layer(x)`) solve vanishing gradients?',
          options: [
            'They delete half the layers during training',
            'The identity path `+ x` ensures a derivative term of `1`, letting gradients flow straight backward without shrinking exponentially',
            'They force all weights to be positive',
            'They replace the optimizer',
          ],
          correctIndex: 1,
          explanation: 'By the sum rule of calculus, $\\frac{\\partial}{\\partial x}(x + F(x)) = I + \\frac{\\partial F}{\\partial x}$, preserving gradient signal across depth.',
        },
      ],
    },
    {
      id: '4-3',
      moduleId: 'mod-4',
      number: '4.3',
      title: 'CNNs, Spatial Inductive Bias & Transfer Learning',
      subtitle: 'Understand convolutions, receptive fields, and how pretrained vision models solve tasks with tiny datasets.',
      durationMinutes: 15,
      track: 'core',
      prerequisites: ['4.1'],
      objectives: [
        'Compute convolution output dimensions given kernel size, stride, and padding.',
        'Explain weight sharing and translation equivariance.',
        'Apply Transfer Learning (freeze backbone $\\rightarrow$ train head $\\rightarrow$ unfreeze & fine-tune) and compare CNNs vs Vision Transformers (ViT).',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Why Not Feed a 1080p Image Into a Plain MLP?',
          paragraphs: [
            'A $1000 \\times 1000 \\times 3$ RGB image has **3 million input numbers**. Connecting that to just 1,000 hidden neurons in a dense MLP takes **3 billion weights** in layer 1 alone—and forgets that neighboring pixels form edges!',
            '**Convolutional Neural Networks (CNNs)** exploit two spatial priors: **locality** (small $3 \\times 3$ sliding filters detect edges, textures, and shapes) and **weight sharing** (the exact same $3 \\times 3$ edge detector slides across the entire image, using 9 weights instead of billions).',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'conv-kernel',
          title: 'Interactive Lab: 2D Convolution Kernel & Feature Map Explorer',
          description:
            'Switch between Sobel Edge, Sharpen, Blur, and Custom 3×3 kernels and hover over pixels to watch the exact element-wise dot product generate the output feature map.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Never Train Vision Models From Scratch in Industry',
          body: 'Use **Transfer Learning**: load a backbone pretrained on millions of images (e.g., ConvNeXt, ResNet, CLIP, or DINOv2). Early layers already know edges/textures. Swap the final classification head, train with a tiny dataset (even 200 images/class!), then optionally unfreeze top blocks with a 10× smaller LR.',
        },
      ],
      quiz: [
        {
          id: 'q4-3-1',
          question: 'A $32 \\times 32$ image passes through a $3 \\times 3$ convolution with `stride=1` and `padding=1`. What is the output spatial size?',
          options: ['$30 \\times 30$', '$32 \\times 32$', '$16 \\times 16$', '$34 \\times 34$'],
          correctIndex: 1,
          explanation: '$\\lfloor (32 + 2(1) - 3) / 1 \\rfloor + 1 = 32$. `padding=1` with a $3\\times 3$ kernel preserves spatial dimensions ("same" padding).',
        },
        {
          id: 'q4-3-2',
          question: 'How does a Vision Transformer (ViT) process an image without convolutions?',
          options: [
            'It reads one pixel at a time with an RNN',
            'It splits the image into fixed patches (e.g. $16 \\times 16$), linearly projects each patch into a vector token, adds positional embeddings, and runs Self-Attention',
            'It converts images into SQL tables',
            'It uses K-Means on RGB values',
          ],
          correctIndex: 1,
          explanation: 'ViT treats image patches just like word tokens, letting attention connect distant parts of an image from layer 1.',
        },
        {
          id: 'q4-3-3',
          question: 'You have 400 labeled X-ray images for a rare condition. What is the best modeling strategy?',
          options: [
            'Train a custom 50-layer CNN with random weights from scratch',
            'Fine-tune a pretrained vision backbone (e.g., ConvNeXt / ViT / BiomedCLIP) with data augmentation',
            'Flatten all pixels into a 1D vector for K-Means',
            'Skip validation to save images',
          ],
          correctIndex: 1,
          explanation: 'Transfer learning leverages universal visual features learned on massive datasets so 400 images suffice to adapt the head/top layers.',
        },
      ],
    },
    {
      id: '4-4',
      moduleId: 'mod-4',
      number: '4.4',
      title: 'Sequence Models: RNNs, LSTMs & Why Attention Won',
      subtitle: 'Understand the sequential bottleneck that led directly to the 2017 Transformer revolution.',
      durationMinutes: 12,
      track: 'core',
      prerequisites: ['4.1', '4.2'],
      objectives: [
        'Trace how RNNs and LSTMs pass a hidden state $h_t$ step-by-step across time.',
        'Identify the two fatal flaws of RNNs: sequential training (cannot parallelize across tokens) and fixed-size bottleneck.',
        'See how Attention eliminated $O(N)$ sequential path length to $O(1)$ direct token-to-token lookup.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'The Bottleneck That Sparked the LLM Era',
          paragraphs: [
            'Before 2017, NLP used **RNNs** and **LSTMs**. An RNN reads token 1, updates hidden state $h_1$; reads token 2 with $h_1$, produces $h_2$; and so on. That creates two massive walls:',
            '1. **Zero Parallelism Across Tokens**: To compute $h_{1000}$, the GPU *must* wait for $h_1 \\dots h_{999}$ sequentially. You cannot scale training to trillions of tokens on massive GPU clusters.',
            '2. **Information Bottleneck**: Even with LSTM forget/input gates, compressing an entire 2,000-word chapter into one fixed-size hidden vector $h_t$ causes early context to decay.',
            '**The Transformer ("Attention Is All You Need", 2017)** deleted recurrence entirely: every token looks directly at every previous token in **parallel** in a single matrix multiplication!',
          ],
        },
        {
          type: 'table',
          title: 'RNN/LSTM vs Transformer Scaling Comparison',
          headers: ['Property', 'RNN / LSTM', 'Transformer (Self-Attention)'],
          rows: [
            ['Training parallelism across sequence', 'Sequential $O(N)$ steps — slow on GPUs', 'Fully parallel $O(1)$ steps during training'],
            ['Path length between token 1 and token 1000', '$1000$ hops (signal decays)', '$1$ direct dot-product hop'],
            ['Per-step memory at inference', '$O(1)$ fixed hidden state', '$O(N)$ KV Cache (grows with context length)'],
          ],
        },
        {
          type: 'callout',
          variant: 'key-takeaway',
          title: 'Why State-Space Models (Mamba / Hybrid Attention) Are Re-Emerging',
          body: 'Notice row 3 above! Transformers pay $O(N^2)$ compute for attention and $O(N)$ KV-cache RAM at inference. Modern hybrid architectures (like Jamba or Qwen-linear variants) blend fast recurrent/linear-state layers with sparse Attention layers to get the best of both worlds.',
        },
      ],
      quiz: [
        {
          id: 'q4-4-1',
          question: 'What was the #1 reason Transformers scaled to massive datasets so much faster than LSTMs?',
          options: [
            'Transformers contain fewer parameters',
            'Self-Attention processes all tokens in a training sequence simultaneously via parallel matrix multiplications instead of step-by-step recurrence',
            'LSTMs cannot process English text',
            'Transformers do not use backpropagation',
          ],
          correctIndex: 1,
          explanation: 'Eliminating sequential $t-1 \\rightarrow t$ dependencies let GPUs saturate tensor cores across entire 4k–128k token sequences in parallel.',
        },
        {
          id: 'q4-4-2',
          question: 'During **inference** (generating token by token), what is the key memory tradeoff of Transformers compared to RNNs?',
          options: [
            'Transformers store a growing KV Cache scaling with context length $N$, whereas RNNs keep a fixed-size state',
            'RNNs require a larger KV Cache',
            'Transformers use zero memory during inference',
            'There is no difference',
          ],
          correctIndex: 0,
          explanation: 'KV caching avoids recomputing earlier tokens, at the cost of storing Key/Value tensors for every token in the context window.',
        },
        {
          id: 'q4-4-3',
          question: 'How did LSTMs partially mitigate the vanishing gradient problem in vanilla RNNs?',
          options: [
            'By replacing all matrices with decision trees',
            'By introducing an additive cell state highway controlled by learned forget, input, and output gates',
            'By reversing the input text',
            'By removing activation functions',
          ],
          correctIndex: 1,
          explanation: 'The LSTM cell state acts similarly to a residual highway across time steps, modulated by sigmoid gates.',
        },
      ],
    },
  ],
};
