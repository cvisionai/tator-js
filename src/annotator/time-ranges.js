
// TimeRanges isn't user constructable so make our own
export class TatorTimeRanges {
  constructor()
  {
    this._buffer=[];
  }

  get length()
  {
    return this._buffer.length;
  }

  clear()
  {
    this._buffer=[];
  }

  start(idx)
  {
    if (idx >= this._buffer.length)
    {
      throw `${idx} not a valid segment`;
    }
    return this._buffer[idx][0];
  }

  end(idx)
  {
    if (idx >= this._buffer.length)
    {
      throw `${idx} not a valid segment`;
    }
    return this._buffer[idx][1];
  }

  push(start,end)
  {
    //console.info(`Pushing ${start} to ${end}`);
    this._buffer.push([start,end]);
    this._merge_collapse();
  }

  remove(start, end)
  {
    for (let idx = 0; idx < this.length; idx++)
    {
      if (end > this.start(idx) && end <= this.end(idx))
      {
        this._buffer[idx][0] = end;
      }
    }
    this._merge_collapse();
  }

  print(name)
  {
    if (name)
      console.info(`${name} Buffered ranges:`)
    else
      console.info("Buffered ranges:")
    for (let idx = 0; idx < this.length; idx++)
    {
      console.info(`\t${this.start(idx)} to ${this.end(idx)}`);
    }
  }

  _merge_collapse()
  {
    // Sort by start time
    this._buffer.sort((a,b)=>a[0]-b[0]);
    let merge_list=[];
    for (let idx = 0; idx < this._buffer.length-1; idx++)
    {
      if (this._buffer[idx][0] >= this._buffer[idx+1][0] && this._buffer[idx][0] < this._buffer[idx+1][1])
      {
        merge_list.push([idx,idx+1]);
        break;
      }
      else if (this._buffer[idx][1] >= this._buffer[idx+1][0] && this._buffer[idx][0] < this._buffer[idx+1][1])
      {
        merge_list.push([idx,idx+1]);
        break;
      }
      else if (this._buffer[idx][1] == this._buffer[idx+1][0])
      {
        merge_list.push([idx,idx+1]);
        break;
      }
    }

    if (merge_list.length > 0)
    {
      let first = merge_list[0][0];
      let second = merge_list[0][1];
      this._buffer[second][0] = Math.min(this._buffer[first][0], this._buffer[second][0]);
      this._buffer[second][1] = Math.max(this._buffer[first][1], this._buffer[second][1]);
      this._buffer.splice(first,1);
      return this._merge_collapse();
    }
    else
    {
      return false;
    }
  }
}

