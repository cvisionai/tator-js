// Import sparkmd5.
import SparkMD5 from "spark-md5";

// Calculates md5 hash.
function md5sum(file) {
  let md5;
  let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
  const chunkSize = 10*1024*1024; // 10MB
  const chunks = 1;
  let currentChunk = 0;
  let spark = new SparkMD5.ArrayBuffer();
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;
      const percentage = (currentChunk / chunks * 10).toFixed(2);
      if (currentChunk < chunks) {
        loadNext();
      } else {
        md5 = spark.end();

        // Salt in the file size
        md5 = SparkMD5.hash(md5 + file.size);
        resolve(md5);
      }
    };
    reader.onerror = error => {
      reject("Error processing MD5");
    };
    const loadNext = () => {
      var start = currentChunk * chunkSize;
      var end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
      reader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  });
}

export { md5sum };
