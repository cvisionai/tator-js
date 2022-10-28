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
      md5 = SparkMD5.hash(md5 + this.file.size);
    }
  };
  reader.onerror = error => {
    console.error("Error processing MD5");
    removeFromActive(this.upload_uid);
  };
  const loadNext = () => {
    var start = currentChunk * chunkSize;
    var end = ((start + chunkSize) >= this.file.size) ? this.file.size : start + chunkSize;
    reader.readAsArrayBuffer(blobSlice.call(this.file, start, end));
  }
  loadNext();
  return md5;
}

export { md5sum };
