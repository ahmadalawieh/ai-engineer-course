import type { CourseModule } from '@/types/course';
import { lesson4_1 } from '../lessons/4-1';
import { lesson4_2 } from '../lessons/4-2';
import { lesson4_3 } from '../lessons/4-3';
import { lesson4_4 } from '../lessons/4-4';

export const module4: CourseModule = {
  id: 'mod-4',
  number: 4,
  title: 'Deep Learning, PyTorch & Neural Architectures',
  subtitle: 'Backpropagation from scratch, PyTorch tensors/autograd/nn.Module loops, normalization, BF16, CNNs/ViT transfer learning, sequence bottlenecks, and AI Engineer scoping.',
  track: 'core',
  recommendedPath: 'ml-depth',
  estimatedHours: 5.4,
  capstoneDeliverable: 'Implement pure-NumPy XOR backpropagation, token-wise LayerNorm/RMSNorm, 2D convolutions, and an LSTM memory cell alongside production PyTorch training templates.',
  lessons: [
    lesson4_1,
    lesson4_2,
    lesson4_3,
    lesson4_4,
  ],
};
