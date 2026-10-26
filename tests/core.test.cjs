const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'); const path=require('node:path');
const jsQR=require('jsqr'); const {PNG}=require('pngjs'); const core=require('../core.js');
fs.mkdirSync(path.join(__dirname,'output'),{recursive:true});
function pixels(code,scale=10){
  const side=(code.modules.size+8)*scale,data=new Uint8ClampedArray(side*side*4);data.fill(255);
  for(let y=0;y<code.modules.size;y++)for(let x=0;x<code.modules.size;x++)if(code.modules.get(y,x))for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){
    const at=(((y+4)*scale+dy)*side+(x+4)*scale+dx)*4;data[at]=16;data[at+1]=37;data[at+2]=57;
  }
  return {side,data};
}
for(const [name,input] of [['url',{type:'url',text:'https://nanalab.kr/apps/?q=한글'}],['unicode',{type:'text',text:'한글 QR 😀 · こんにちは · مرحبا'}],['wifi',{type:'wifi',ssid:'NaNa;:Lab',password:'a;:b\\c"',auth:'WPA',hidden:true}],['open-wifi',{type:'wifi',ssid:'Guest',auth:'nopass',password:'must-not-appear'}]]) {
  test('QR encode/decode round trip: '+name,()=>{
    const {text,code}=core.create(input),{side,data}=pixels(code);const decoded=jsQR(data,side,side);assert.ok(decoded);assert.equal(decoded.data,text);
    if(name==='open-wifi')assert.ok(!text.includes('must-not-appear'));
    const png=new PNG({width:side,height:side});png.data=Buffer.from(data);fs.writeFileSync(path.join(__dirname,'output',name+'.png'),PNG.sync.write(png));
    const svg=core.svg(code);assert.match(svg,/^<svg/);assert.match(svg,/viewBox=/);fs.writeFileSync(path.join(__dirname,'output',name+'.svg'),svg);
  });
}
test('validate empty, unsafe URL and capacity errors',()=>{
  for(const text of ['', 'example.com','javascript:alert(1)','data:text/html,test','https://name:secret@example.com/'])assert.throws(()=>core.create({type:'url',text}));
  assert.throws(()=>core.create({type:'text',text:'가'.repeat(1000)}));
  assert.throws(()=>core.create({type:'wifi',ssid:'a'.repeat(33),auth:'nopass'}));
  assert.throws(()=>core.create({type:'wifi',ssid:'Office',auth:'WPA'}));
});
test('quiet zone and whole-pixel canvas dimensions',()=>{
  const {code}=core.create({type:'url',text:'https://example.com'});const fills=[];const context={fillRect:(...args)=>fills.push(args)};
  const canvas={getContext:()=>context};core.draw(canvas,code,512);assert.equal(canvas.width,canvas.height);assert.ok(canvas.width>=512);
  assert.ok(fills.slice(1).every(([x,y,w,h])=>Number.isInteger(x)&&Number.isInteger(y)&&w===h&&x>=4*w&&y>=4*h));
});
