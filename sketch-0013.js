const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const eases= require('eases');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate:true,
};
let audio;
let audioContext,audioData,sourceNode,analyserNode;
let manager;
let minDb,maxDb;
const sketch = () => {
  const numCircles=20;
  const numSlices=1;
  const slice=Math.PI*2/numSlices;
  const radius=160;
  const bins=[];
  const lineWidths=[];
  const rotationOffsets=[];
  let lineWidth,phi;
  let bin, mapped;
  for (let  i=0;i<numCircles*numSlices;i++){
    bin=random.rangeFloor(4,100);

    bins.push(bin);
    
  }
  for(let i=0;i<numCircles;i++){
    const t=i/(numCircles-1);
    lineWidth=eases.expoIn(t)*100+4;
    lineWidths.push(lineWidth);
  }
  for(let i=0;i<numCircles;i++){
    rotationOffsets.push(random.range(Math.PI * -0.65,Math.PI * 0.65));
  }
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    if(!audioContext)return;
    analyserNode.getFloatFrequencyData(audioData);
    context.save();
    context.translate(width*0.5,height*0.5);
    let cradius=radius;
    for(let i=0;i<numCircles;i++){
      context.save();
      context.rotate(rotationOffsets[i])
      cradius+=lineWidths[i]*0.5+2;
      for(let j=0;j<numSlices;j++){
        context.rotate(slice);
        context.lineWidth=lineWidths[i];
        context.strokeStyle='red';
        bin=bins[i*numSlices+j]
        mapped=math.mapRange(audioData[bin],minDb,maxDb,0,1,true);
        phi=slice*mapped;

        context.beginPath();
        context.arc(0,0,cradius,0,phi);
        context.stroke();  
      }
      cradius+=lineWidths[i]*0.5;
      context.restore();
    }
    context.restore();
    context.save();
    context.fillStyle='black';
    context.beginPath();
    context.fillRect(0, height*0.5-height*0.01,width*0.3,height*0.02);
    context.fillRect(width*0.5-width*0.01,height,width*0.02,-height*0.3);
    context.stroke();
    context.restore();

    //for(let i=0;i<bins.length;i++){
      //const bin=bins[i];
      //const avg = getAverage(audioData);
      //const mapped=math.mapRange(audioData[bin],analyserNode.minDecibels,analyserNode.maxDecibels,0,1,true);
      //const radius=mapped*300;
      //console.log(avg)
    //}

  };
};
const addListener =()=>{
  window.addEventListener("mouseup",()=>{
    if(!audioContext) createAudio();
    if (audio.paused) {
      audio.play();
      manager.play();
    }
    else {
      audio.pause();
      manager.pause();
    }
  })
};
const createAudio=()=>{
  audio =document.createElement('audio');
  audio.src='./audio/chaos.mp3';
  audioContext = new AudioContext();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize=512;
  analyserNode.smoothingTimeConstant=0.9;
  sourceNode.connect(analyserNode);
  minDb=analyserNode.minDecibels;
  maxDb=analyserNode.maxDecibels;
  audioData = new Float32Array(analyserNode.frequencyBinCount);
  console.log(audioData.length);
};
const getAverage=(data)=>{
  let sum=0;
  for(let i=0;i<data.length;i++){
    sum+=data[i];
  }
  return sum/data.length;
}
const start = async()=>{
  addListener();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
}
start();

