<script setup lang="ts">
import { onMounted, ref } from 'vue';

import * as d3 from "d3";
import d3Cloud from "d3-cloud";

import { text, stopwords } from '../assets/data';


const wordcloud = ref<HTMLElement | null>(null);
let wordcloudInitialized = false;

const colors = [
    "#F05627",
    "#E5F4E0",
    "#38001E"
]


onMounted(() => {
    document.body.id = 'cloud';
    
const processWords = (text) => {
    const maxWords = 100;

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

    let wordsArray = Object.keys(wordCount).map(d => ({
        text: d,
        size: Math.min(50, wordCount[d]) * 1,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    wordsArray = wordsArray.sort((a, b) => b.size - a.size).slice(0, maxWords);

    const wordsUsedOnce = wordsArray.filter(word => word.size === 1);
    const otherWords = wordsArray.filter(word => word.size > 1);

    for (let i = wordsUsedOnce.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordsUsedOnce[i], wordsUsedOnce[j]] = [wordsUsedOnce[j], wordsUsedOnce[i]];
    }

    return otherWords.concat(wordsUsedOnce);
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
                    fill: 'black',
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
    fontFamily = "CriteriaCF",
    fontScale = 15,
    fill = 'black',
    padding = 2,
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
            const textGroup = g.append("g");
            textGroup.append("text")
                .datum({text, size})
                .attr("id", "text")
                .attr("font-size", size)
                .attr("fill", () => colors[Math.floor(Math.random() * colors.length)])
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .attr("style", `animation-delay: ${Math.random() * 10}s`)
                .text(text);
        });

    cloud.start();
    // invalidation && invalidation.then(() => cloud.stop());
    return svg.node();
}
</script>

<template>
  <div id="wordcloud" ref="wordcloud"></div>
</template>

