export class Sam {
  constructor(url) {
    this.setServer(url);
    this._embeddings = null;
  }

  set width(val) {
    this._width = val;
  }
  set height(val) {
    this._height = val;
  }

  async getEmbedding(image) {
    const form = new FormData();
    form.set("file", image);

    var requestOptions = {
      method: "POST",
      headers: {"Accept": "application/octet-stream"},
      body: form,
    };

    return fetch(this._serverUrl, requestOptions)
      .then(response => {
        // here prompt to start SAM soon
        dispatchEvent(new CustomEvent("sam-process", {detail: {status: 'ready'}}));

        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        const floatArray = new Float32Array(arrayBuffer);
        const embeddings = new ort.Tensor("float32", floatArray, [1, 256, 64, 64]);

        this._embeddings = embeddings;
        dispatchEvent(new CustomEvent("sam-process", {detail: {status: 'done', embeddings}}));
      });
  }


  _getPoly(prompts) {
    return this.getPoly(prompts).then((poly) => {
      return poly;
    });
  }

  // get the biggest poly's surrounding box
  getPoly(prompts) {
    const n = prompts.length;
    const pointCoords = new Float32Array(2 * n);
    const pointLabels = new Float32Array(n);
    const samScale = 1024 / Math.max(this._width, this._height);

    // Add clicks and scale to what SAM expects
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = prompts[i].x * this._width * samScale;
      pointCoords[2 * i + 1] = prompts[i].y * this._height * samScale;
      pointLabels[i] = prompts[i].label;
    }

    // Create the tensor
    const pointCoordsTensor = new ort.Tensor("float32", pointCoords, [1, n, 2]);
    const pointLabelsTensor = new ort.Tensor("float32", pointLabels, [1, n]);

    const imageSizeTensor = new ort.Tensor("float32", [
      this._height,
      this._width,
    ]);

    if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
      return;

    // There is no previous mask, so default to an empty tensor
    const maskInput = new ort.Tensor(
      "float32",
      new Float32Array(256 * 256),
      [1, 1, 256, 256]
    );
    // There is no previous mask, so default to 0
    const hasMaskInput = new ort.Tensor("float32", [0]);

    const feeds = {
      image_embeddings: this._embeddings,
      point_coords: pointCoordsTensor,
      point_labels: pointLabelsTensor,
      orig_im_size: imageSizeTensor,
      mask_input: maskInput,
      has_mask_input: hasMaskInput,
    };
    return this._model.run(feeds).then((data) => {
      let poly = [];
      let mat = cv.matFromArray(
        this._height,
        this._width,
        cv.CV_32F,
        data.masks.data
      );
      let thresholded = new cv.Mat(this._height, this._width, cv.CV_8UC1);
      cv.threshold(mat, thresholded, 0, 255, cv.THRESH_BINARY);
      cv.convertScaleAbs(thresholded, thresholded, 255, 0);
      mat.delete();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(
        thresholded,
        contours,
        hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
      );
      thresholded.delete();
      if (contours.size() > 0) {
        let epsilon = 2; //0.005 * cv.arcLength(contours.get(0), true);
        let approx = new cv.Mat();
        let largest = 0;
        let maxArea = 0;
        let [minX, minY, maxX, maxY] = [1, 1, 0, 0];
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i);
          const area = cv.contourArea(contour, false);
          if (area > maxArea) {
            largest = contour;
            maxArea = area;
          }
        }
        cv.approxPolyDP(largest, approx, epsilon, true);
        for (let i = 0; i < 2 * approx.rows; i += 2) {
          const x = approx.data32S[i * approx.cols] / this._width;
          const y = approx.data32S[i * approx.cols + 1] / this._height;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        poly.push([minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]);
      }
      return poly;
    });
  }

  async setServer(url) {
    const MODEL_URL =
      "https://s3.us-east-1.amazonaws.com/tator-ci/sam_onnx_quantized_example_vit_l.onnx";
    this._model = await ort.InferenceSession.create(MODEL_URL);
    this._serverUrl = url;
  }
}
