const express=require("express");require("dotenv").config();const bodyParser=require("body-parser"),morgan=require("morgan"),app=express(),myApi=require("./api-min.js"),port=process.env.PORT||3e3;app.use(morgan("dev")),app.use(bodyParser.urlencoded({extended:!0})),app.use(bodyParser.json()),app.use("/vendors",express.static("vendors")),app.use("/resources",express.static("resources"));const CWD=process.cwd();app.get("/",(e,s)=>{"production"!==app.get("env")&&s.sendFile(`${CWD}/index.html`)}),app.post("/",(e,s)=>myApi.getUserlocation(e.body).then(e=>myApi.getWeatherData(e)).then(e=>s.status(201).json(e)).catch(e=>s.status(400).json(e))),app.post("/search",(e,s)=>myApi.getCoordinatesForCity(e.body.city).then(myApi.getWeatherData).then(e=>s.status(201).json(e)).catch(e=>s.status(400).json(e))),app.use("/",(e,s,t,r)=>{t.status(e.status||500).send(e.message||"INTERNAL SERVER ERROR")}),app.listen(port,()=>{console.log(`Server running on ${port}/`)});