import { mount } from "svelte";
import TimeAttackApp from "./TimeAttackApp.svelte";
import "./app.css";

mount(TimeAttackApp, { target: document.getElementById("app")! });
