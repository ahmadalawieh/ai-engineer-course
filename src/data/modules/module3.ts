import type { CourseModule } from '@/types/course';

export const module3: CourseModule = {
  id: 'mod-3',
  number: 3,
  title: 'Classical Machine Learning Mastery',
  subtitle: 'Linear models, regularization, bias-variance tradeoff, XGBoost/GBDTs, clustering, and scikit-learn pipelines.',
  track: 'ds',
  estimatedHours: 4,
  capstoneDeliverable: 'Train & evaluate an end-to-end regularized classifier and tree ensemble from scratch.',
  lessons: [
    {
      id: '3-1',
      moduleId: 'mod-3',
      number: '3.1',
      title: 'Linear, Logistic Regression & Bias-Variance Tradeoff',
      subtitle: 'Master the foundational parametric models and L1/L2 regularization.',
      durationMinutes: 17,
      track: 'ds',
      prerequisites: ['1.3', '1.4'],
      objectives: [
        'Explain the Bias-Variance tradeoff (underfitting vs overfitting) visually and diagnostically.',
        'Contrast L1 (Lasso) sparsity vs L2 (Ridge) weight shrinkage.',
        'Derive how Logistic Regression outputs calibrated probabilities via Sigmoid + Binary Cross-Entropy.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Why Linear Models Still Win in Production',
          paragraphs: [
            'Before spinning up a GPU, benchmark a Linear or Logistic Regression. They train in milliseconds, expose interpretable feature weights (log-odds), predict well-calibrated probabilities, and serve as the **exact building block** of every linear layer inside a Transformer.',
            '**Bias vs Variance**: High **Bias** (too simple, e.g., fitting a straight line to a curve) underfits both train and test. High **Variance** (too flexible, e.g., degree-15 polynomial) memorizes noise—train error is near 0%, test error explodes.',
          ],
        },
        {
          type: 'math',
          title: 'Ridge (L2) vs Lasso (L1) Regularized Loss',
          latex: 'L_{\\text{L2}} = \\text{MSE} + \\lambda \\sum_{j} w_j^2 \\qquad L_{\\text{L1}} = \\text{MSE} + \\lambda \\sum_{j} |w_j|',
          breakdown: [
            { symbol: '\\lambda', meaning: 'Regularization strength: larger $\\lambda$ shrinks weights toward zero, reducing variance' },
            { symbol: '\\sum w_j^2', meaning: 'L2 (Ridge): shrinks correlated weights smoothly toward zero without zeroing them out' },
            { symbol: '\\sum |w_j|', meaning: 'L1 (Lasso): diamond constraint corners push useless weights to **exact `0.0`** (automatic feature selection)' },
          ],
          intuition:
            'Regularization adds a "complexity tax" to weights. Whenever a feature barely improves training loss, the penalty forces its weight down so the model ignores spurious noise.',
        },
        {
          type: 'simulator',
          simulatorId: 'regularization',
          title: 'Interactive Lab: Polynomial Degree & L2 Regularization Explorer',
          description:
            'Adjust polynomial degree (1 to 12) and regularization $\\lambda$ on noisy sine data. Watch the Train vs Validation MSE curves reveal the exact sweet spot between underfitting and overfitting.',
        },
        {
          type: 'python-lab',
          labId: 'lab-3-1',
          title: 'Lab 3.1: Logistic Regression Training Loop in NumPy',
          prompt:
            'Implement `fit_logistic(X, y, lr, steps)` using Sigmoid $\\sigma(z) = \\frac{1}{1+e^{-z}}$ and Binary Cross-Entropy gradients: `dw = (X.T @ (preds - y)) / n`, `db = np.mean(preds - y)`. Return `(w, b)`.',
          starterCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def fit_logistic(X: np.ndarray, y: np.ndarray, lr: float = 0.2, steps: int = 400):
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(steps):
        # 1. preds = sigmoid(X @ w + b)
        # 2. compute dw and db
        # 3. update w and b
        pass
    return w, b

X = np.array([[-2.0], [-1.0], [1.0], [2.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w, b = fit_logistic(X, y)
print("Probs:", np.round(sigmoid(X @ w + b), 3))`,
          testCode: `import numpy as np
X = np.array([[-2.0, -1.0], [-1.5, -0.5], [1.5, 0.5], [2.0, 1.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w, b = fit_logistic(X, y, lr=0.3, steps=500)
probs = sigmoid(X @ w + b)
assert probs[0] < 0.1 and probs[1] < 0.1, f"Negatives should be <0.1, got {probs[:2]}"
assert probs[2] > 0.9 and probs[3] > 0.9, f"Positives should be >0.9, got {probs[2:]}"
print("PASS: Logistic regression learned clean decision boundary!")`,
          solutionCode: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

def fit_logistic(X: np.ndarray, y: np.ndarray, lr: float = 0.2, steps: int = 400):
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(steps):
        preds = sigmoid(X @ w + b)
        err = preds - y
        dw = (X.T @ err) / n
        db = float(np.mean(err))
        w -= lr * dw
        b -= lr * db
    return w, b`,
          hint: 'Notice how clean the BCE + Sigmoid gradient is: `(preds - y)` directly! No chain-rule mess needed.',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q3-1-1',
          question: 'Your model gets 99.4% training accuracy and 68.0% validation accuracy. Which diagnosis and fix apply?',
          options: [
            'High Bias (underfitting) — add more polynomial features',
            'High Variance (overfitting) — increase regularization ($\\lambda$), gather more data, or simplify the model',
            'Learning rate is zero',
            'Test set has too few classes',
          ],
          correctIndex: 1,
          explanation: 'A massive gap between train and validation performance is the classic signature of high variance (overfitting).',
        },
        {
          id: 'q3-1-2',
          question: 'You have 500 features where 450 are pure noise and want a sparse, interpretable model. Which penalty should you choose?',
          options: ['L2 (Ridge)', 'L1 (Lasso)', 'No penalty', 'Dropout of 0.0'],
          correctIndex: 1,
          explanation: 'L1 penalty produces sparse solutions by driving irrelevant feature weights to exact zero.',
        },
        {
          id: 'q3-1-3',
          question: 'Why must features be standardized before applying L1 or L2 regularization?',
          options: [
            'Otherwise features measured in small units (e.g. kilometers vs millimeters) require huge weights and get unfairly penalized',
            'Because NumPy cannot multiply unscaled floats',
            'Regularization automatically ignores negative values',
            'It is only needed for decision trees',
          ],
          correctIndex: 0,
          explanation: 'L1/L2 penalizes $|w_j|$; changing a column from meters to millimeters multiplies its needed weight by 1,000, distorting the penalty.',
        },
      ],
    },
    {
      id: '3-2',
      moduleId: 'mod-3',
      number: '3.2',
      title: 'Decision Trees, Random Forests & XGBoost',
      subtitle: 'Understand why Gradient Boosted Decision Trees still beat deep learning on structured tabular data.',
      durationMinutes: 18,
      track: 'ds',
      prerequisites: ['3.1'],
      objectives: [
        'Explain how Decision Trees split data using Gini Impurity / Entropy.',
        'Contrast Bagging (Random Forest — reduces variance) vs Boosting (XGBoost/LightGBM — reduces bias).',
        'Tune key GBDT hyperparameters (`max_depth`, `learning_rate`, `subsample`, `early_stopping`).',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Why XGBoost/LightGBM Dominate Tabular Data',
          paragraphs: [
            'On images, audio, and text, neural networks rule. On **tabular business data** (SQL rows: user age, country, LTV, churn flags), **Gradient Boosted Decision Trees (XGBoost, LightGBM, CatBoost)** consistently outperform neural networks while training in seconds on CPUs.',
            'Why? Trees naturally handle non-linear thresholds, missing values, mixed numeric/categorical types, and uninformative noise features without needing scaling.',
          ],
        },
        {
          type: 'table',
          title: 'Bagging (Random Forest) vs Boosting (XGBoost / LightGBM)',
          headers: ['Dimension', 'Random Forest (Bagging)', 'XGBoost / LightGBM (Boosting)'],
          rows: [
            ['How trees are built', '**In parallel**, independently on bootstrap samples + random feature subsets', '**Sequentially**: each new shallow tree predicts the **residual errors** of previous trees'],
            ['Primary effect', 'Slashes **variance** (averaging deep overfit trees cancels noise)', 'Slashes **bias** (iteratively refines predictions)'],
            ['Typical tree depth', 'Deep trees (`max_depth=15..None`)', 'Shallow weak learners (`max_depth=3..8`)'],
            ['Overfitting risk if too many trees', 'Very low (plateaus safely)', 'High unless controlled via small `learning_rate` + `early_stopping`'],
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-3-2',
          title: 'Lab 3.2: Build a Mini Gradient Booster from Scratch',
          prompt:
            'See how boosting works under the hood! Implement `fit_additive_stumps(X, y, n_rounds, lr)` where each round fits a 1-split Decision Stump to the **negative residuals** `r = y - pred`, then adds `lr * stump_pred` to `pred`.',
          starterCode: `import numpy as np

def best_stump(x_1d: np.ndarray, residuals: np.ndarray):
    best_thresh, best_left, best_right, best_loss = 0.0, 0.0, 0.0, float('inf')
    for thresh in np.unique(x_1d):
        left_mask = x_1d <= thresh
        if left_mask.all() or (~left_mask).all():
            continue
        l_val = residuals[left_mask].mean()
        r_val = residuals[~left_mask].mean()
        preds = np.where(left_mask, l_val, r_val)
        loss = np.mean((residuals - preds) ** 2)
        if loss < best_loss:
            best_thresh, best_left, best_right, best_loss = thresh, l_val, r_val, loss
    return best_thresh, best_left, best_right

def boost_1d(x: np.ndarray, y: np.ndarray, n_rounds: int = 15, lr: float = 0.3):
    pred = np.full_like(y, y.mean(), dtype=float)
    for _ in range(n_rounds):
        # 1. Compute residuals = y - pred
        # 2. Fit best_stump(x, residuals)
        # 3. Update pred += lr * stump_predictions
        pass
    return pred

x = np.linspace(0, 10, 20)
y = np.where(x < 3, 1.0, np.where(x < 7, 5.0, 2.0))
preds = boost_1d(x, y)
print("MSE:", round(float(np.mean((y - preds) ** 2)), 4))`,
          testCode: `import numpy as np
x = np.linspace(0, 10, 30)
y = np.where(x < 3.5, 1.0, np.where(x < 7.0, 6.0, 2.0))
preds = boost_1d(x, y, n_rounds=35, lr=0.3)
mse = float(np.mean((y - preds) ** 2))
assert mse < 0.05, f"Boosted stumps should fit piecewise function tightly (MSE < 0.05), got {mse}"
print(f"PASS: Gradient boosting reduced MSE to {mse:.5f}!")`,
          solutionCode: `import numpy as np

def best_stump(x_1d: np.ndarray, residuals: np.ndarray):
    best_thresh, best_left, best_right, best_loss = 0.0, 0.0, 0.0, float('inf')
    for thresh in np.unique(x_1d):
        left_mask = x_1d <= thresh
        if left_mask.all() or (~left_mask).all():
            continue
        l_val = residuals[left_mask].mean()
        r_val = residuals[~left_mask].mean()
        preds = np.where(left_mask, l_val, r_val)
        loss = np.mean((residuals - preds) ** 2)
        if loss < best_loss:
            best_thresh, best_left, best_right, best_loss = thresh, l_val, r_val, loss
    return best_thresh, best_left, best_right

def boost_1d(x: np.ndarray, y: np.ndarray, n_rounds: int = 15, lr: float = 0.3):
    pred = np.full_like(y, y.mean(), dtype=float)
    for _ in range(n_rounds):
        residuals = y - pred
        thresh, l_val, r_val = best_stump(x, residuals)
        stump_pred = np.where(x <= thresh, l_val, r_val)
        pred += lr * stump_pred
    return pred`,
          hint: 'Each round fits the residual `y - pred` (the negative gradient of MSE!) and takes a small step `lr * stump_pred`.',
          packages: ['numpy'],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Key Limitation of Trees: Extrapolation',
          body: 'Decision trees predict constants inside leaf boxes, so they **cannot extrapolate** trends beyond the maximum `y` seen in training (e.g., forecasting rising revenue next year). Use linear/time-series models or difference the target if strong upward trends exist.',
        },
      ],
      quiz: [
        {
          id: 'q3-2-1',
          question: 'In Gradient Boosted Decision Trees, what is each new tree trained to predict?',
          options: [
            'Random subsets of the original features only',
            'The pseudo-residuals (negative gradient of the loss with respect to current ensemble predictions)',
            'The PCA components of X',
            'The cluster centroids of the dataset',
          ],
          correctIndex: 1,
          explanation: 'Each sequential tree corrects the errors (negative gradient of the loss) left behind by earlier trees.',
        },
        {
          id: 'q3-2-2',
          question: 'Why does Random Forest randomly sample a subset of features (`max_features`) at every split?',
          options: [
            'To force trees to be diverse and decorrelated so averaging them slashes variance',
            'Because trees can only read 3 columns at a time',
            'To make the trees identical',
            'To increase training bias intentionally',
          ],
          correctIndex: 0,
          explanation: 'Without feature subsampling, one dominant feature makes every tree nearly identical, ruining the variance reduction of averaging.',
        },
        {
          id: 'q3-2-3',
          question: 'Your XGBoost validation loss starts rising after 180 trees while training loss keeps dropping to 0. What should you do?',
          options: [
            'Increase `max_depth` from 5 to 20',
            'Enable `early_stopping_rounds`, lower `learning_rate` or `max_depth`, and add `subsample`/`colsample_bytree`',
            'Remove validation data',
            'Multiply all features by 100',
          ],
          correctIndex: 1,
          explanation: 'Early stopping halts boosting at the validation minimum; shallower trees and row/column subsampling curb overfitting.',
        },
      ],
    },
    {
      id: '3-3',
      moduleId: 'mod-3',
      number: '3.3',
      title: 'Unsupervised Learning: K-Means, PCA & UMAP',
      subtitle: 'Discover customer segments, compress dimensions, and visualize high-dimensional embeddings.',
      durationMinutes: 15,
      track: 'ds',
      prerequisites: ['1.2'],
      objectives: [
        'Run K-Means clustering and diagnose failure modes (non-spherical clusters, scale sensitivity, picking $k$).',
        'Contrast PCA (linear variance projection) vs t-SNE / UMAP (non-linear neighborhood preservation).',
        'Detect outliers with Isolation Forests.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Finding Structure Without Labels',
          paragraphs: [
            'When you lack target labels $y$, **clustering** groups similar points (user personas, topic clusters over LLM embeddings) and **dimensionality reduction** compresses 1,536-dim vectors down to 2D/3D for visualization or noise removal.',
            '**K-Means** alternates two dead-simple steps until centroids stop moving: 1) Assign each point to its nearest centroid (Euclidean distance); 2) Move each centroid to the mean of its assigned points. Always use **K-Means++** initialization and **scale features first**!',
          ],
        },
        {
          type: 'simulator',
          simulatorId: 'kmeans',
          title: 'Interactive Lab: K-Means Clustering Step-by-Step Playground',
          description:
            'Click to add or regenerate data clusters, choose $K$, and step through Assign $\\rightarrow$ Update Centroids to watch Voronoi partitions and Inertia (WCSS) converge.',
        },
        {
          type: 'table',
          title: 'PCA vs t-SNE vs UMAP',
          headers: ['Method', 'Type', 'Preserves', 'When to Use'],
          rows: [
            ['**PCA**', 'Linear orthogonal projection', 'Global variance & distances', 'Feature compression before ML, noise reduction, interpretable variance explained'],
            ['**t-SNE**', 'Non-linear probabilistic', 'Local neighborhoods only (global distances distorted!)', '2D exploratory visualization of small/medium datasets'],
            ['**UMAP**', 'Non-linear manifold', 'Local + better global structure, much faster', 'Visualizing large embedding spaces (RAG documents, BERTopic)'],
          ],
        },
      ],
      quiz: [
        {
          id: 'q3-3-1',
          question: 'When does K-Means fail badly even with the right $K$?',
          options: [
            'When clusters are concentric rings, crescent moons, or wildly different densities/scales',
            'When $K = 3$',
            'When points are 2-dimensional',
            'When features are standardized',
          ],
          correctIndex: 0,
          explanation: 'K-Means draws straight Voronoi boundaries around spherical means; density-based DBSCAN or spectral clustering handles rings/moons.',
        },
        {
          id: 'q3-3-2',
          question: 'You compress 1,536-dim embeddings to 2D using t-SNE and see Cluster A is twice as far from Cluster B as from C. Can you conclude A is semantically closer to C?',
          options: [
            'Yes, t-SNE strictly preserves global Euclidean distances',
            'No — t-SNE preserves local neighborhoods, while inter-cluster distances and cluster sizes can be distorted',
            'Yes, if perplexity is 5',
            'Only if features were positive',
          ],
          correctIndex: 1,
          explanation: 't-SNE focuses on local neighbor probabilities; global distances between separated clusters are not reliably meaningful.',
        },
        {
          id: 'q3-3-3',
          question: 'What does "explained variance ratio" tell you in PCA?',
          options: [
            'Classification accuracy on the test set',
            'What fraction of the total dataset variance is retained by each principal component',
            'The number of clusters in K-Means',
            'The p-value of the first feature',
          ],
          correctIndex: 1,
          explanation: 'Summing the top-$k$ ratios tells you how much signal you kept (e.g. keeping 95% variance while dropping 80% of columns).',
        },
      ],
    },
    {
      id: '3-4',
      moduleId: 'mod-3',
      number: '3.4',
      title: 'Production ML Pipelines, Tuning & SHAP Explainability',
      subtitle: 'Put cross-validation, hyperparameter tuning, and feature attribution into a clean, repeatable workflow.',
      durationMinutes: 15,
      track: 'ds',
      prerequisites: ['2.3', '3.2'],
      objectives: [
        'Pick the right CV scheme: K-Fold, StratifiedKFold, GroupKFold, TimeSeriesSplit.',
        'Explain why Bayesian/Optuna tuning beats Grid Search.',
        'Interpret predictions using SHAP (Shapley values) vs Permutation Importance.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Cross-Validation Is Your Ground Truth Compass',
          paragraphs: [
            'Never tune hyperparameters on your final test set—that turns your test set into training data. Use **Cross-Validation (CV)** inside `Pipeline` objects so scalers and encoders fit inside *each fold* independently.',
            '**Choose the right CV**: Imbalanced classification? `StratifiedKFold`. Multiple rows per user/hospital? `GroupKFold` (otherwise the same user appears in train and val!). Time series? `TimeSeriesSplit` (expanding window).',
          ],
        },
        {
          type: 'code',
          title: 'Gold-Standard Leak-Free Scikit-Learn Pipeline',
          language: 'python',
          code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression

pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])

pipe = Pipeline([
    ("prep", pre),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000)),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="average_precision")`,
          caption: 'Wrapping preprocessing inside `Pipeline` guarantees zero leakage across CV folds and identical transforms at inference time.',
        },
        {
          type: 'callout',
          variant: 'interview',
          title: 'SHAP vs Tree Feature Importance',
          body: 'Default Gini feature importance biases toward high-cardinality numeric columns. **Permutation Importance** measures actual validation metric drop when a column is shuffled. **SHAP** (game-theoretic Shapley values) gives exact, additive per-prediction explanations: *"Base rate 12% +35% due to 3 missed payments −8% due to 5-year tenure = 39% risk."* ',
        },
      ],
      quiz: [
        {
          id: 'q3-4-1',
          question: 'A medical dataset contains 5 chest X-rays per patient across 1,000 patients. Which CV splitter prevents patient leakage?',
          options: ['Standard 5-Fold CV', 'StratifiedKFold on X-rays', 'GroupKFold grouped by `patient_id`', 'Leave-One-Out on images'],
          correctIndex: 2,
          explanation: 'GroupKFold keeps all images from any single patient strictly in train OR validation, preventing the model from memorizing patient anatomy.',
        },
        {
          id: 'q3-4-2',
          question: 'Why does Random Search (and Bayesian Optimization like Optuna) almost always beat Grid Search?',
          options: [
            'Grid Search wastes most runs varying unimportant hyperparameters on a fixed grid, whereas Random/Bayesian search explores more unique values of sensitive parameters',
            'Grid Search cannot tune floating-point numbers',
            'Random Search requires no validation data',
            'Optuna skips training the model',
          ],
          correctIndex: 0,
          explanation: 'Usually only 1–2 hyperparameters drive most performance; a 5×5 grid only tests 5 values of each, while 25 random/Bayesian trials test 25 distinct values.',
        },
        {
          id: 'q3-4-3',
          question: 'What is the unique advantage of SHAP over global permutation importance?',
          options: [
            'SHAP works without any trained model',
            'SHAP provides both global importance AND exact local per-row attribution showing which features pushed a specific prediction up or down',
            'SHAP runs in O(1) constant time for any black-box model',
            'SHAP removes correlated features automatically',
          ],
          correctIndex: 1,
          explanation: 'SHAP decomposes every individual prediction into signed feature contributions summing from the expected base value to the model output.',
        },
      ],
    },
  ],
};
