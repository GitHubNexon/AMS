const mongoose = require("mongoose");
const EntriesModel = require("../models/EntriesModel");


async function start() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/ndc_ams");
    console.log("Connected to MongoDB");
    // Ensure idfy completes before starting populateReporting
    // await octRe();
    process();
    console.log("done");
  } catch (error) {
    console.error(error);
  }
}

async function process(){
    const entries = await EntriesModel.find();
    const ledgers = entries.map(m=>m.ledgers).flat();
    let totalcr = 0;
    let totaldr = 0;
    for(let i = 0; i < ledgers.length; i++){
        if(ledgers[i].cr) totalcr += ledgers[i].cr;
        if(ledgers[i].dr) totaldr += ledgers[i].cr;
    }
    console.log(totalcr);
    console.log(totaldr);
}

start();