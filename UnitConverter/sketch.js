let Input;
let Output;
let Amount;
let Enter;
let Result;
let Facts;
let lastNumber, lasterNumber;
let Chosen;

const API_KEY = "qlmdwDwlMJkm1wM07bclwt0HFMZ1z6oxYuX2Ggmd";

// HTTPGet;
// fetch;
// async/await;
// event-listener;

function setup() {
  createCanvas(800, 610);
  
  //UI (User Interface)
  const y = height / 4;
  
  Input = createSelect();
  Input.size(150);
  Input.position(((width / 2) - (Input.width / 2)) - 300, y);
  addLengthOptions(Input);
  Input.selected("meter");
  
  
  Output = createSelect();
  Output.size(150);
  Output.position(((width / 2) - (Output.width / 2)) + 300, y);
  addLengthOptions(Output);
  Output.selected("meter");

  
  Amount = createInput('','number');
  Amount.center('horizontal');
  Amount.size(140); 
  Amount.position((Amount.x), y);  
  Amount.attribute("placeholder", "Type a number");
  
  Enter = createButton('Enter'); 
  Enter.center('horizontal');
  Enter.size(80);
  Enter.position(Enter.x - 40, y + 40);
  Enter.mousePressed(ConvertingEpicly);
  
  //Press Enter inside the middle box (called enter) to convert
  Amount.elt.addEventListener("keydown", (e) => {
    if (e.key ==="Enter") ConvertingEpicly();
  });
  
  Result = createP("");
  Result.position (width/100, y + 80);  
  
  Facts = createP("");
  Facts.position (width/75, y + 140);
  Facts.size(775, 60);
  Facts.style('color', 'white');
  Facts.style('font-size', '24px');
}

function draw() {
  const y = height/2;
  const y2 = height/4;
  background(220);
  textSize(24);
  textFont("Comic Sans MS");
  textAlign(CENTER);
  text('From', Input.x + 75, y2 - 10);
  text('To', Output.x + 75, y2 - 10);
  textSize(48);
  text('Unit Converter', width/2, y - 250);
  textSize(16);
  fill(0);
  rect(0, 300, width, height);
}

function addLengthOptions(sel){
  //Keys must match API Ninjas "Length" units.
  sel.option('meter'); //1
  sel.option('kilometer'); //2
  sel.option('centimeter'); //3
  sel.option('millimeter'); //4
  sel.option('micrometer'); //5
  sel.option('nanometer'); //6
  sel.option('mile'); //7
  sel.option('yard'); //8
  sel.option('foot'); //9
  sel.option('inch'); //10
  sel.option('nautical mile', 'nautical_mile'); //11
  sel.option('furlong'); //12
  sel.option('light year', 'light_year'); //13
  sel.option('astronomical unit', 'astronomical_unit'); //14
  
}

async function ConvertingEpicly() {
  let Amo = parseFloat(Amount.value());
  let In = Input.value();
  let Out = Output.value();
  
  if (!Number.isFinite(Amo)) {
    Result.html("Please type valid numbers :(");
    Facts.html("");
    return;
  }
  
  Result.html("Converting...");
  Facts.html("Loading...");
  
  try {
    const url = new URL(`https://api.api-ninjas.com/v1/unitconversion`);
    url.searchParams.set('amount', Amo);
    url.searchParams.set('unit', In);
    
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {"X-Api-Key": API_KEY},
    });
    
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`${res.status} ${res.statusText}:${msg}`);
    }
    
    const data = await res.json();
    
//     const converted = data?.conversions?.[Out];
    
//     if (converted === undefined) {
//       throw new Error(`No conversion found for target unit "${Out}".`);
//     }
    const converted =
  data && data.conversions ? data.conversions[Out] : undefined;
    
    const pretty = formatNumber(converted);
    Chosen = getRandomInt(1, 14);
    
    Result.html(`${Amo} ${In} = <b>${pretty}<b> ${Out}`);
    Fact();
    
    } catch (err) {
      Result.html(`Error: ${escapeHtml(String(err.message || err))}<br>` + `<small>If this is a CORs error in the browser console, you'll need a tiny backend/proxy to call the API securely.<small>`);
      console.error(err);
  }
}

function formatNumber(n) {
  const s = Number(n).toPrecision(10);
  return String(Number(s));
}

function escapeHtml(str) {
  return str
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;")
}
lasterNumber = null;
lastNumber = null;
function getRandomInt(min, max) {
  let newNumber;
  do {
    newNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (newNumber === lastNumber || newNumber === lasterNumber);
  lasterNumber = lastNumber;
  lastNumber = newNumber;
  return newNumber;
}
function Fact() {
  if (Chosen == 1){
    Facts.html(" The meter was created during the French Revolution (1790s) by the French Academy of Sciences to replace disparate, traditional measurements with a universal, natural standard");
    }
  else if (Chosen == 2){
    Facts.html("The kilometer (km) was developed in France during the 1790s as part of the new decimal-based metric system, formally adopted in 1795 to replace chaotic feudal measurements");
    }
  else if (Chosen == 3){
    Facts.html("The centimeter originated during the French Revolution in 1791 as part of the new decimal metric system, defined as 1/100 of a meter.");
    }
  else if (Chosen == 4){
    Facts.html("The millimeter was established in 1795 as part of the French metric system, created during the French Revolution to replace chaotic, localized measurements with a rational, decimal-based system.");
    }
  else if (Chosen == 5){
    Facts.html("The micrometer originated in the 17th century with William Gascoigne for astronomy, evolved into a handheld tool by Jean Palmer (1848), and was refined into a, modern, industrial standard by Brown & Sharpe in the 1860s");
    }
  else if (Chosen == 6){
    Facts.html('Richard Adolf Zsigmondy used ultramicroscopes to study particles down to 10nm(nanometer) and used the term "nanometer". A nanometer is one-billionth of a meter');
    }
  else if (Chosen == 7){
    Facts.html(`The mile originated from the Roman mille passus ("thousand paces"), measuring 5,000 Roman feet based on a soldier's double-step.`);
    }
  else if (Chosen == 8){
    Facts.html("The yard, as a unit of measurement, originated from Anglo-Saxon roots, commonly believed to be defined by King Henry I of England (1100–1135) as the distance from his nose to his thumb");
    }
  else if (Chosen == 9){
    Facts.html("The foot measurement originated in ancient civilizations (Egypt, Greece, Rome) as a practical, anthropomorphic unit roughly matching a human foot, typically 250-335 mm.");
    }
  else if (Chosen == 10){
    Facts.html('The inch (symbol: in or ″) is a unit of length in the British Imperial and the United States customary systems of measurement. It is equal to ⁠1/36 yard or 1/12 of a foot.');
    }
  else if (Chosen == 11){
    Facts.html("A nautical mile is a unit of length used in air, marine, and space navigation, and for the definition of territorial waters. Historically, it was defined as the meridian arc length corresponding to one minute (⁠1/60 of a degree) of latitude at the equator, so that Earth's polar circumference is very near to 21,600 nautical miles (that is 60 minutes × 360 degrees).");
    }
  else if (Chosen == 12){
    Facts.html("The name furlong derives from the Old English words furh (furrow) and lang (long).Dating back at least to early Anglo-Saxon times, it originally referred to the length of the furrow in one acre of a ploughed open field (a medieval communal field which was divided into strips).");
    }
  else if (Chosen == 13){
    Facts.html("The light-year unit appeared a few years after the first successful measurement of the distance to a star other than the Sun, by Friedrich Bessel in 1838. The star was 61 Cygni, and he used a 160-millimetre (6.2 in) heliometre designed by Joseph von Fraunhofer.");
    }
  else if (Chosen == 14){
    Facts.html("The astronomical unit (symbol: au or AU) is a unit of length defined to be exactly equal to 149597870700 m. Around 280 BC, Aristarchus carefully measured the Moon-Earth-Sun angle when the Moon is in its first quarter and used this to estimate the distance to the Sun. The exact timing and angle measurement are essential. He estimated the angle at as 87° (the true value being close to 89.853°) and reported in On the Sizes and Distances of the Sun and Moon the distance to the Sun is 18 to 20 times the distance to the Moon, whereas the true ratio is about 389.174.");
    }
}