<script setup lang="ts">
import { onMounted, ref } from 'vue';

import * as d3 from "d3";
import d3Cloud from "d3-cloud";

import { text, stopwords } from '../assets/data';


const wordcloud = ref<HTMLElement | null>(null);
let wordcloudInitialized = false;

onMounted(() => {
    document.body.id = 'cloud';
    
    const processWords = (text) => {
        const wordCount = text.split(/[\s.]+/g)
            .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
            .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
            .map(w => w.replace(/['’]s$/g, ""))
            .map(w => w.substring(0, 30))
            .map(w => w.toLowerCase())
            .filter(w => w && !stopwords.has(w))
            .reduce((acc, w) => {
                acc[w] = (acc[w] || 0) + 1;
                return acc;
            }, {});

        return Object.keys(wordCount).map(d => ({
            text: d,
            size: Math.min(50, wordCount[d]) * 1
        }));
    };

    const words = processWords(text);

    console.log(words.length);

    const updateWordcloudSize = () => {
        if (wordcloud.value) {
            if (!wordcloudInitialized) {
                const theWordcloud = WordCloud(words, {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    size: d => d.size,
                    rotate: () => 0,
                    fill: 'black'
                });
                wordcloud.value.append(theWordcloud);
                wordcloudInitialized = true;
            } else {
                const svgElement = wordcloud.value.querySelector('svg');
                if (svgElement) {
                    svgElement.setAttribute('width', window.innerWidth.toString());
                    svgElement.setAttribute('height', window.innerHeight.toString());
                }
            }
        }
    };

    window.addEventListener('resize', updateWordcloudSize);
    updateWordcloudSize();
});

function WordCloud(text: { text: string, size: number }[], {
    size = d => d.size,
    word = d => d.text,
    marginTop = 10,
    marginRight = 10,
    marginBottom = 10,
    marginLeft = 10,
    width = 0,
    height = 0,
    maxWords = -1,
    fontFamily = "DM Sans",
    fontScale = 15,
    fill = 'black',
    padding = 1,
    rotate = 0,
    invalidation
} = {}) {
    const words = text;

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle")
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);

    const cloud = d3Cloud()
        .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
        .words(words)
        .padding(padding)
        .rotate(rotate)
        .font(fontFamily)
        .fontSize(d => Math.sqrt(d.size) * fontScale)
        .on("word", ({size, x, y, rotate, text}) => {
            g.append("text")
                .datum({text, size})
                .attr("font-size", size)
                .attr("fill", fill)
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text);
        });

    cloud.start();
    invalidation && invalidation.then(() => cloud.stop());
    return svg.node();
}
</script>

<template>
  <div id="wordcloud" ref="wordcloud"></div>
</template>

