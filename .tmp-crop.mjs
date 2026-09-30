import sharp from 'sharp';
const [, , src, prefix, chunk = '1500'] = process.argv;
const m = await sharp(src).metadata();
const c = +chunk;
for (let y = 0, i = 0; y < m.height; y += c, i++) {
  await sharp(src)
    .extract({ left: 0, top: y, width: m.width, height: Math.min(c, m.height - y) })
    .toFile(`${prefix}-${i}.png`);
}
console.log(m.width, m.height);
