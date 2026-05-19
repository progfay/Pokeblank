import { mount } from "svelte";
import TopPage from "./TopPage.svelte";
import "./app.css";

mount(TopPage, { target: document.getElementById("app")! });
