import type { Lesson } from '@/types/course';

export const lesson4_3: Lesson = {
  id: '4-3',
  moduleId: 'mod-4',
  number: '4.3',
  title: 'CNNs, Spatial Inductive Bias, ViT & Transfer Learning',
  subtitle: 'Understand 2D convolution dot products, receptive fields, spatial dimension formulas, Vision Transformers (ViT), and industry transfer learning.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['4.1', '4.2'],
  requires: ['mlp-nonlinearity', 'pytorch-nn-module-loops'],
  teaches: [
    'conv2d-inductive-bias',
    'conv-output-dimensions',
    'vision-transformers-vit',
    'transfer-learning-vision',
  ],
  objectives: [
    'Compute 2D convolution feature maps numerically by hand and in NumPy, verifying output spatial sizes `(H + 2P - K) // S + 1`.',
    'Explain why local receptive fields and weight sharing crush raw MLPs in parameter efficiency and translation equivariance.',
    'Compare Convolutional backbones (ConvNeXt / ResNet) against Vision Transformers (ViT patch tokenization + Self-Attention).',
    'Apply the two-stage Transfer Learning recipe (freeze pretrained backbone -> train linear head -> fine-tune top blocks with low LR).',
  ],
  checkWithoutNotes: [
    'Why does feeding a `1000 x 1000` RGB image into a plain 1,000-neuron dense MLP create 3 billion first-layer weights while a `3 x 3` Conv layer uses only 27 weights per filter?',
    'Calculate the exact output width and height of a `32 x 32` feature map passed through a `5 x 5` convolution with `padding = 2` and `stride = 2`.',
    'Explain how a Vision Transformer (`ViT-B/16`) turns a `224 x 224` image into sequence tokens without a single sliding convolution.',
    'Outline the two-phase Transfer Learning fine-tuning schedule for adapting CLIP/ConvNeXt onto 300 specialized factory-defect photos.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Spatial Structure Breaks Dense MLPs—and Built Computer Vision',
      paragraphs: [
        'If you flatten a crisp `1000 x 1000 x 3` RGB photograph into a 1D vector, it contains **three million numbers**. Connecting that raw input vector to even a modest 1,000-neuron dense MLP hidden layer requires `3,000,000 * 1,000 = 3 billion` weights inside layer 1 alone! Worse still, an MLP treats pixel `(0, 0)` and pixel `(0, 1)` identically to pixel `(999, 999)`: shifting a cat three pixels to the right scrambles every input coordinate and forces the MLP to re-learn what whiskers look like from scratch at every location.',
        '**Convolutional Neural Networks (CNNs)** solve both walls with two spatial inductive biases: **locality** (small `3 x 3` filters inspect tight neighboring pixels to detect edges, corners, and textures) and **weight sharing** (the exact same `3 x 3` edge detector slides across the entire image, learning universal patterns with tiny parameter counts). Even in the multimodal LLM era—where teams inspect receipts, medical scans, or UI screenshots—understanding spatial patching, stride/padding math, and pretrained transfer learning separates engineers who train crisp vision adapters in an afternoon from teams burning cloud GPUs from scratch.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Sliding CSS Stencil Lens Across a Grid',
      frontendConcept: 'Sliding a small `3 x 3` CSS blur or sharpen SVG `<feConvolveMatrix>` filter over every pixel neighborhood on a canvas',
      aiConcept: '2D Convolution Kernel, Weight Sharing, and Hierarchical Receptive Fields',
      explanation:
        'A convolution kernel acts like a tiny reusable `3 x 3` magnifying glass holding 9 learned weights. Instead of wiring separate billions of weights for every pixel coordinate, the network slides that single 9-weight lens across every row and column—computing dot products everywhere. Stacking `3 x 3` layers builds hierarchy naturally: Layer 1 sees 3-pixel edges, Layer 2 combines edges into `5 x 5` corners, and Layer 5 sees entire eyes, wheels, or text glyphs.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: 2D Convolution Dot Product & Output Spatial Math by Hand',
      paragraphs: [
        'Walk through one exact `3 x 3` vertical-edge filter sliding over a `4 x 4` grayscale patch (`padding = 0`, `stride = 1`). Suppose our top-left `3 x 3` image patch has bright left pixels (`10`) and dark right pixels (`0`): `[[10, 10, 0], [10, 10, 0], [10, 10, 0]]`, and our vertical Sobel-like filter is `K = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]`. Multiply element-wise and sum: `(10*1 + 10*0 + 0*(-1)) + (10*2 + 10*0 + 0*(-2)) + (10*1 + 10*0 + 0*(-1)) = 10 + 20 + 10 = +40`! Slide one column right onto a flat uniform black region `[[0, 0, 0], ...]` and the sum drops cleanly to `0`.',
        'Verify output dimensions cleanly using the universal spatial formula: `H_out = floor((H + 2 * P - K) / S) + 1`. Here `(4 + 0 - 3) // 1 + 1 = 2`, emitting a `2 x 2` output map. Notice why `3 x 3` kernels with `padding = 1` and `stride = 1` appear everywhere in ResNet and ConvNeXt: `(H + 2*1 - 3) // 1 + 1 = H` ("same padding"), keeping spatial dimensions steady until an intentional `stride = 2` or `MaxPool2d(2)` halves resolution while doubling feature channels (`64 -> 128 -> 256`). Note also multi-channel parameters: a Conv2D layer mapping `C_in = 3` RGB channels to `C_out = 64` filters with `3 x 3` kernels holds `64 * (3 * 3 * 3 + 1 bias) = 1,792` weights—regardless of whether the input image is `64 x 64` or `4096 x 4096`!',
      ],
    },
    {
      type: 'simulator',
      simulatorId: 'conv-kernel',
      title: 'Interactive Lab: 2D Convolution Kernel & Feature Map Explorer',
      description:
        'Switch between Sobel Edge, Sharpen, Blur, and Custom 3x3 kernels and hover over pixels to watch the exact element-wise dot product generate the output feature map.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Vision Transformers (ViT) vs CNNs & Global Average Pooling',
      paragraphs: [
        'How does a **Vision Transformer (ViT)** process images without sliding `3 x 3` convolutions? Slice a `224 x 224 x 3` photo into non-overlapping `16 x 16` square tiles (`14 * 14 = 196` patches total, each holding `16 * 16 * 3 = 768` raw numbers). One linear projection maps each 768-dim patch into a Transformer embedding token, prepends a learnable `[CLS]` token (or pools patch tokens cleanly), adds 2D learned positional embeddings, and feeds all 197 tokens into standard Self-Attention! Whereas a CNN needs many layers before pixel `(0, 0)` talks to `(220, 220)`, ViT connects opposite corners in **Layer 1**, while CNNs generalize slightly better on very tiny datasets thanks to built-in spatial locality.',
        'Also note how modern CNNs (`ResNet`, `ConvNeXt`) shrunk classification head size dramatically: older VGG architectures flattened a `7 x 7 x 512 = 25,088` tensor straight into giant dense layers holding 100M+ parameters. Modern CNNs apply **Global Average Pooling (`AdaptiveAvgPool2d(1)`)** collapsing each `(7, 7)` channel map into a single average scalar (`512` values total!), cutting parameter bloat and accepting arbitrary input image sizes cleanly.',
      ],
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Industry Rule: Never Train Vision Backbones From Scratch Without Massive Data',
      body: 'Always start with **Transfer Learning**: load a backbone pretrained on millions of images (`ConvNeXt`, `ResNet50`, `DINOv2`, or `CLIP` vision tower). Stage 1: **Freeze** backbone weights (`param.requires_grad = False`), replace the final linear head (`nn.Linear(in_features, num_classes)`), and train just that lightweight head for a few epochs—even 200 images per class converge rapidly without wrecking pretrained edge detectors! Stage 2 (optional): **Unfreeze** top transformer/conv blocks and fine-tune end-to-end with a **10x smaller learning rate** (`1e-5`) alongside RandAugment/color-jitter data augmentation.',
    },
    {
      type: 'prose',
      heading: 'Common Computer Vision & Transfer Learning Mistakes & How to Debug Them',
      paragraphs: [
        '1) Fine-tuning an entire pretrained ResNet/ViT immediately with a huge learning rate (`1e-2`) alongside a randomly initialized classification head: chaotic initial errors flowing back from random head weights blast straight through carefully tuned pretrained filters ("catastrophic forgetting"). Train the frozen head first at `1e-3`, then unfreeze top blocks gently at `1e-5`.',
        '2) Forgetting ImageNet normalization (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`) or mismatched RGB vs BGR channel ordering (`OpenCV` loads BGR by default!): feeding `[0..255]` integers instead of `[0..1]` standardized RGB channels destroys pretrained backbone activations silently.',
        '3) Applying random horizontal flip (`RandomHorizontalFlip`) blindly to directional tasks such as reading rotated PDF text, OCR digits (`6` vs `9`), medical situs anatomy, or left/right steering labels: flipping images horizontally reverses left-turn labels into false training targets!',
        '4) Splitting video frames or augmented crops randomly across train and validation splits: two frames captured 0.1 seconds apart from the same camera clip (`frame_101`, `frame_102`) are near-duplicates! Always split strictly by `patient_id`, `store_id`, or `video_clip_id` via `GroupKFold`.',
        '5) Freezing `BatchNorm` layers improperly or forgetting `model.eval()` on tiny validation batches: when fine-tuning a frozen CNN backbone with `batch_size = 4`, leaving BatchNorm in training mode overwrites pretrained ImageNet running statistics with noisy 4-image estimates.',
        '6) Misunderstanding `1 x 1` convolutions (`Conv2d(256, 64, kernel_size=1)`): a `1 x 1` kernel does not inspect neighboring pixels; instead it mixes channel depth cheaply at every pixel coordinate, acting like a per-pixel linear projection that compresses bottleneck channels cleanly in ResNet and MobileNet blocks.',
        '7) Ignoring aspect-ratio distortion when resizing rectangular wide receipts (`2000 x 400`) forcibly into square `224 x 224` tensors: aggressive squashing warps text characters beyond recognition—use letterbox padding (`preserve aspect ratio + pad borders`) for document/OCR vision workloads.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 4.3 Recap: Spatial Vision & Transfer Learning',
      body: '- Convolutions exploit local neighborhoods and shared weights (`64 * 3*3*3` vs billions of dense MLP weights).\n- Compute spatial outputs cleanly via `floor((H + 2*P - K) / S) + 1` (`K=3, P=1, S=1` preserves size).\n- Vision Transformers tokenize `16 x 16` image patches into sequence vectors so Self-Attention connects global regions from Layer 1.\n- Use Global Average Pooling (`AdaptiveAvgPool2d`) before final linear heads to prevent parameter explosion.\n- Fine-tune pretrained backbones in two stages (frozen head warmup -> low-LR top unfreeze) using matching RGB normalization.',
    },
    {
      type: 'python-lab',
      labId: 'lab-4-3-conv',
      difficulty: 'guided',
      requires: ['numpy-arrays'],
      title: 'Lab 4.3A: Implement 2D Valid Convolution in Pure NumPy',
      prompt:
        'Implement `conv2d_valid(image: np.ndarray, kernel: np.ndarray) -> np.ndarray` for a 2D grayscale array `(H, W)` and 2D kernel `(KH, KW)` (`stride=1, padding=0`), returning the `(H - KH + 1, W - KW + 1)` feature map of element-wise dot products.',
      starterCode: `import numpy as np

def conv2d_valid(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    H, W = image.shape
    KH, KW = kernel.shape
    out_h, out_w = H - KH + 1, W - KW + 1
    out = np.zeros((out_h, out_w), dtype=float)
    # Loop r in range(out_h), c in range(out_w):
    # multiply patch image[r:r+KH, c:c+KW] * kernel and sum
    return out`,
      testCode: `import numpy as np
img = np.array([
    [10., 10., 0., 0.],
    [10., 10., 0., 0.],
    [10., 10., 0., 0.],
    [10., 10., 0., 0.],
])
sobel_x = np.array([[1., 0., -1.], [2., 0., -2.], [1., 0., -1.]])
fmap = conv2d_valid(img, sobel_x)
assert fmap.shape == (2, 2), f"Expected (2, 2), got {fmap.shape}"
assert np.allclose(fmap, [[40.0, 40.0], [40.0, 40.0]]), f"Expected vertical edge +40 everywhere, got {fmap}"
print("PASS: 2D valid convolution detected exact vertical edge magnitude (+40)!")`,
      solutionCode: `import numpy as np

def conv2d_valid(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    H, W = image.shape
    KH, KW = kernel.shape
    out_h, out_w = H - KH + 1, W - KW + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for r in range(out_h):
        for c in range(out_w):
            patch = image[r:r + KH, c:c + KW]
            out[r, c] = float(np.sum(patch * kernel))
    return out`,
      hint: 'Slice `patch = image[r:r+KH, c:c+KW]` at each output `(r, c)` coordinate and store `np.sum(patch * kernel)`.',
      hints: [
        'Use nested loops `for r in range(out_h): for c in range(out_w):`.',
        'Extract the window `patch = image[r:r + KH, c:c + KW]`.',
        'Assign `out[r, c] = float(np.sum(patch * kernel))`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-3-dim',
      difficulty: 'spec',
      requires: ['conv2d-inductive-bias'],
      title: 'Lab 4.3B: Spatial Output Shape & Conv vs MLP Parameter Counter',
      prompt:
        'Implement `conv_stats(h: int, w: int, c_in: int, c_out: int, k: int, padding: int, stride: int) -> dict` returning `{"out_h": ..., "out_w": ..., "conv_params": ..., "mlp_params": ...}` where `conv_params = c_out * (c_in * k * k + 1)` and `mlp_params = (h * w * c_in * c_out) + c_out` (dense single projection to `c_out` outputs).',
      starterCode: `def conv_stats(h: int, w: int, c_in: int, c_out: int, k: int, padding: int, stride: int) -> dict:
    # Compute out_h, out_w via floor division (h + 2*padding - k) // stride + 1
    # Compute conv_params and equivalent dense mlp_params
    pass`,
      testCode: `s1 = conv_stats(32, 32, 3, 64, k=3, padding=1, stride=1)
assert s1["out_h"] == 32 and s1["out_w"] == 32
assert s1["conv_params"] == 64 * (3 * 9 + 1)  # 1,792
assert s1["mlp_params"] == (32 * 32 * 3 * 64) + 64  # 196,672 (>100x larger!)
s2 = conv_stats(64, 64, 3, 32, k=5, padding=2, stride=2)
assert s2["out_h"] == 32 and s2["out_w"] == 32
print("PASS: Spatial output formulas and Conv vs MLP parameter savings verified!")`,
      solutionCode: `def conv_stats(h: int, w: int, c_in: int, c_out: int, k: int, padding: int, stride: int) -> dict:
    out_h = (h + 2 * padding - k) // stride + 1
    out_w = (w + 2 * padding - k) // stride + 1
    conv_params = c_out * (c_in * k * k + 1)
    mlp_params = (h * w * c_in * c_out) + c_out
    return {
        "out_h": int(out_h),
        "out_w": int(out_w),
        "conv_params": int(conv_params),
        "mlp_params": int(mlp_params),
    }`,
      hint: 'Use integer floor division `// stride` before adding `1` for `out_h` and `out_w`.',
      hints: [
        '`out_h = (h + 2 * padding - k) // stride + 1` (same expression with `w` for `out_w`).',
        'Each of `c_out` filters owns `c_in * k * k` kernel weights plus `1` scalar bias.',
        'Equivalent dense layer connects every `h * w * c_in` input scalar to `c_out` outputs plus `c_out` biases.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-4-3-maxpool',
      difficulty: 'debug',
      requires: ['conv-output-dimensions', 'numpy-arrays'],
      title: 'Lab 4.3C: Fix Off-by-One Stride Bug in 2D Max Pooling',
      prompt:
        'A broken downsampler advances sliding coordinates by `1` instead of `stride = 2` (overlapping pools instead of halving spatial size!) AND takes `np.mean` instead of `np.max`! Fix `max_pool2d(x: np.ndarray, size: int = 2, stride: int = 2) -> np.ndarray` using exact integer step sizes `(H - size) // stride + 1`.',
      starterCode: `import numpy as np

def max_pool2d(x: np.ndarray, size: int = 2, stride: int = 2) -> np.ndarray:
    H, W = x.shape
    # BUG: uses stride=1 indexing and np.mean instead of stride and np.max!
    out_h = H - size + 1
    out_w = W - size + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for r in range(out_h):
        for c in range(out_w):
            out[r, c] = float(np.mean(x[r:r + size, c:c + size]))
    return out`,
      testCode: `import numpy as np
grid = np.array([
    [1., 3., 2., 4.],
    [5., 6., 1., 0.],
    [2., 0., 9., 8.],
    [4., 1., 3., 7.],
])
pooled = max_pool2d(grid, size=2, stride=2)
assert pooled.shape == (2, 2), f"Expected (2, 2) halved map, got {pooled.shape}"
assert np.allclose(pooled, [[6.0, 4.0], [4.0, 9.0]]), f"Expected [[6,4],[4,9]], got {pooled}"
print("PASS: Fixed stride indexing and max aggregation in 2D MaxPool!")`,
      solutionCode: `import numpy as np

def max_pool2d(x: np.ndarray, size: int = 2, stride: int = 2) -> np.ndarray:
    H, W = x.shape
    out_h = (H - size) // stride + 1
    out_w = (W - size) // stride + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for r in range(out_h):
        for c in range(out_w):
            sr, sc = r * stride, c * stride
            out[r, c] = float(np.max(x[sr:sr + size, sc:sc + size]))
    return out`,
      hint: 'Step input window start coordinates by `sr = r * stride` and `sc = c * stride`, and replace `np.mean` with `np.max`.',
      hints: [
        'Compute `out_h = (H - size) // stride + 1` and `out_w = (W - size) // stride + 1`.',
        'Multiply loop index by `stride`: `sr, sc = r * stride, c * stride`.',
        'Take `float(np.max(x[sr:sr + size, sc:sc + size]))`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q4-3-1',
      type: 'multiple-choice',
      question: 'A `32 x 32` feature map passes through a `3 x 3` convolution with `stride = 1` and `padding = 1`. What is the exact output spatial shape?',
      options: [
        '`30 x 30` because every sliding `3 x 3` convolution shrinks image edges by two pixels unconditionally',
        '`34 x 34` because adding 1 pixel of padding on each border expands the final spatial grid size by two',
        '`16 x 16` because modern convolutional layers automatically apply 2x2 pooling simultaneously inside Conv2D',
        '`32 x 32`',
      ],
      correctIndex: 3,
      explanation: '`floor((32 + 2*1 - 3) / 1) + 1 = 32`. `padding=1` with a `3 x 3` kernel and `stride=1` implements exact same-size spatial preservation.',
    },
    {
      id: 'q4-3-2',
      type: 'multiple-choice',
      question: 'How does a Vision Transformer (ViT) process a photograph without using convolutional kernels?',
      options: [
        'It reads raw RGB bytes sequentially one pixel per time step inside a bidirectional LSTM network',
        'It runs K-Means clustering across pixel coordinates before applying logistic regression',
        'It converts RGB arrays directly into relational SQL tables indexed by hue and saturation values',
        'It splits the image into patches, projects tokens, and runs Self-Attention',
      ],
      correctIndex: 3,
      explanation: 'ViT slices images into fixed patches (e.g., `16 x 16`), embeds them linearly with positional encodings, and applies global Transformer Self-Attention.',
    },
    {
      id: 'q4-3-3',
      type: 'multiple-choice',
      question: 'You have 400 labeled X-ray scans for a rare condition. What is the strongest practical modeling strategy?',
      options: [
        'Train a custom 50-layer deep residual CNN initialized completely randomly from scratch across 200 epochs',
        'Skip validation splits completely so every single scarce scan enters training gradient updates',
        'Flatten all `224 x 224` raw pixels directly into a 50k-dimensional K-Means clustering pipeline',
        'Fine-tune a pretrained vision backbone with augmentation and a frozen head warmup',
      ],
      correctIndex: 3,
      explanation: 'Pretrained backbones (`ConvNeXt`, `ResNet`, `DINOv2`) already extract rich edges and textures, letting 400 images adapt a head cleanly without overfitting.',
    },
    {
      id: 'q4-3-4',
      type: 'numeric',
      question: 'A `64 x 64` feature map enters a `5 x 5` convolution with `padding = 2` and `stride = 2`. What is the output height `out_h`?',
      options: [],
      correctIndex: 0,
      correctNumber: 32,
      tolerance: 0,
      unit: 'pixels',
      explanation: '`floor((64 + 2*2 - 5) / 2) + 1 = floor(63 / 2) + 1 = 31 + 1 = 32`.',
    },
    {
      id: 'q4-3-5',
      type: 'spot-bug',
      question: 'Why does a fine-tuned pretrained classifier score 98% validation AUC in a notebook yet drop to random 50% predictions when reading camera frames via OpenCV?',
      code: `frame = cv2.imread("photo.jpg")  # returns uint8 BGR [0..255]
tensor = torch.from_numpy(frame).permute(2, 0, 1).float()`,
      options: [
        'PyTorch `permute(2, 0, 1)` rotates images upside down before passing channels into convolutions',
        'ImageNet models need RGB `[0..1]` normalization, not raw BGR `[0..255]`',
        'Calling `.float()` on `uint8` image matrices rounds every pixel channel value upward toward `255.0`',
        'Transfer learning backbones fail completely unless input dimensions stay odd integers like `223 x 223`',
      ],
      correctIndex: 1,
      explanation: 'OpenCV loads BGR instead of RGB, and pretrained vision backbones expect `[0..1]` scaled floats normalized by ImageNet `mean`/`std`.',
    },
    {
      id: 'q4-3-6',
      type: 'predict-output',
      question: 'A `3 x 3` grayscale image of constant ones `np.ones((3, 3))` is convolved (`valid`, no padding) with `sobel = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]`. What scalar value outputs?',
      options: [
        '`+4.0` because positive kernel coefficients accumulate across uniform bright input regions',
        '`+8.0` because summing the entire `3 x 3` pixel patch yields nine minus one bias',
        '`0.0` (symmetric positive and negative weights cancel on flat regions)',
        '`-4.0` because negative right-column Sobel weights dominate flat uniform neighborhoods',
      ],
      correctIndex: 2,
      explanation: 'On uniform flat intensities (`c`), `(1+2+1)*c + (-1-2-1)*c = 0.0`—edge detectors fire zero response where intensity does not change!',
    },
    {
      id: 'q4-3-7',
      type: 'multi-select',
      question: 'Which two properties explain why CNNs use drastically fewer parameters than dense MLPs on high-resolution images?',
      options: [
        '**Local receptive fields** (`3 x 3` patches) rather than connecting every distant pixel pairwise in layer 1',
        '**Weight sharing** sliding the exact same filter weights across every spatial coordinate',
        'Converting all color images permanently into single 1-pixel grayscale summaries beforehand',
        'Disabling bias parameters across all hidden layers during backward propagation',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Local connectivity and spatial weight sharing shrink first-layer weights from billions down to a few hundred or thousand parameters.',
    },
    {
      id: 'q4-3-8',
      type: 'multiple-choice',
      question: 'When fine-tuning a vision model to read rotated warehouse shipping digits (`6` vs `9`, `"LEFT"` vs `"RIGHT"`), which augmentation introduces label corruption?',
      options: [
        'Mild random brightness and contrast jittering mimicking shifting warehouse overhead lighting conditions',
        'Small centered `5%` crop scaling while keeping every target glyph safely inside the frame',
        'Random horizontal/vertical flipping that reverses left/right or turns `6` into `9`',
        'Applying standard ImageNet channel mean subtraction and unit standard deviation scaling before batching',
      ],
      correctIndex: 2,
      explanation: 'Geometric flips alter semantic ground truth on directional signage, OCR text, and asymmetric digits (`6` vs `9`); use photometric augmentations instead.',
    },
    {
      id: 'q4-3-9',
      type: 'ordering',
      question: 'Order the safe two-stage Transfer Learning recipe for adapting a pretrained vision model onto 350 domain images:',
      items: [
        'Split dataset by entity/camera group (`GroupKFold`) to avoid near-duplicate frame leaks',
        'Load pretrained backbone with matching RGB `[0..1]` + ImageNet normalization pipeline',
        'Freeze backbone parameters and train the new randomly initialized head (`lr ~ 1e-3`)',
        'Optionally unfreeze top layers and fine-tune gently with a small learning rate (`lr ~ 1e-5`)',
        'Evaluate calibration and accuracy strictly in `model.eval()` + `torch.no_grad()` mode',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Clean grouped split -> matching normalization -> warm up frozen head -> gentle low-LR unfreeze -> eval-mode testing.',
    },
  ],
};
