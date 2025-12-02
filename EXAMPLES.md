# CLIPSeg AI - Usage Examples v2.0

## 🎯 High Precision Mode Examples

### Example 1: Product Photography (Clean Cutout)
**Goal**: Extract a shoe for an e-commerce listing.
1.  **Upload**: Photo of a shoe on a table.
2.  **Prompt**: "shoe"
3.  **Mode**: Enable **High Precision Mode**.
4.  **Result**: You get a perfectly sharp cutout of the shoe, including laces.
5.  **Action**: Click **"Remove BG"** to save as transparent PNG.

### Example 2: Complex Shapes (Plants)
**Goal**: Segment a houseplant with many leaves.
1.  **Upload**: Photo of a plant.
2.  **Prompt**: "plant"
3.  **Mode**: Enable **High Precision Mode**.
4.  **Why**: CLIPSeg might blur the leaves together. SAM will trace each leaf individually.

---

## 🎨 Magic Brush Examples

### Example 3: Fixing "Over-Segmentation"
**Scenario**: You segmented a "person", but it included the chair they are sitting on.
1.  **Generate**: Standard segmentation.
2.  **Edit**: Click **"Edit Mask"**.
3.  **Tool**: Select **"-" (Subtract)** brush.
4.  **Action**: Paint over the chair to remove it.
5.  **Save**: The mask now only contains the person.

### Example 4: Adding Missing Parts
**Scenario**: You segmented a "dog", but the tail was missed.
1.  **Generate**: Standard segmentation.
2.  **Edit**: Click **"Edit Mask"**.
3.  **Tool**: Select **"+" (Add)** brush.
4.  **Action**: Paint over the tail.
5.  **Save**: The full dog is now segmented.

---

## 🎚️ Threshold Examples

### Example 5: Faint Objects
**Scenario**: Segmenting smoke or a ghost reflection.
- **Setting**: Set Threshold to **0.2 (Loose)**.
- **Result**: Captures faint pixels that would otherwise be ignored.

### Example 6: Distinct Objects
**Scenario**: Segmenting a red ball on a red table.
- **Setting**: Set Threshold to **0.7 (Strict)**.
- **Result**: Forces the model to be more confident, helping separate the ball from the similar background.
