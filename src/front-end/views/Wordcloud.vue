<script setup lang="ts">
import { onMounted, ref } from 'vue';

import * as d3 from "d3";

// @ts-ignore
import d3Cloud from "d3-cloud";

import { text, stopwords } from '../assets/data';

const wordcloud = ref<HTMLElement | null>(null);
let wordcloudInitialized = false;



const DENColor = {
    pleasantlyPink: "#BF8097",
    outstandingOrange: "#9A2400",
    maturedMaroon: "#38001E",
    progressivePistachio: "#6E7D68",
    black: "#0D0D0D",
    white: "#FFFFFF",
    success: "#2EC786",
    error: "#FF3B53"
};

const colors = [
    DENColor.progressivePistachio,
    DENColor.maturedMaroon,
    DENColor.black,
    DENColor.white
]


let resizeListener : any;

onMounted(async () => {
    document.body.id = 'cloud';
    

    window.electronAPI.onUpdateCloud(() => {
        initCloud();
    });

    initCloud();

});


const initCloud = async () => {

    // empty the cloud
    wordcloudInitialized = false;
    wordcloud.value.innerHTML = '';


    let storedWords = await window.electronAPI.getWords();
    // shuffle
    storedWords = storedWords.sort(() => Math.random() - 0.5);
    console.log(storedWords);



    const words = processWords(storedWords);

    console.log(words.length);

    // reset the listener
    if (resizeListener) {
        window.removeEventListener('resize', resizeListener);
    }

    resizeListener = window.addEventListener('resize', updateWordcloudSize);
    updateWordcloudSize(words);

}


const processWords = (wordsArray : string[]) => {
    const maxWords = 100;

    const wordCount = 
        wordsArray.join(' ')
        .split(/[\s.]+/g)
        .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
        .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
        .map(w => w.replace(/['’]s$/g, ""))
        .map(w => w.substring(0, 30))
        .map(w => w.toLowerCase())
        .filter(w => w && !stopwords.has(w))
        .reduce((acc : any, w : string) => {
            acc[w] = (acc[w] || 0) + 1;
            return acc;
        }, {});

    let wordsArrayProcessed = Object.keys(wordCount).map(d => ({
        text: d,
        size: Math.min(50, wordCount[d]) * 1,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    wordsArrayProcessed = wordsArrayProcessed.sort((a, b) => b.size - a.size).slice(0, maxWords);

    const wordsUsedOnce = wordsArrayProcessed.filter(word => word.size === 1);
    const otherWords = wordsArrayProcessed.filter(word => word.size > 1);

    for (let i = wordsUsedOnce.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordsUsedOnce[i], wordsUsedOnce[j]] = [wordsUsedOnce[j], wordsUsedOnce[i]];
    }

    return otherWords.concat(wordsUsedOnce);
};

const updateWordcloudSize = (words: any) => {
        if (wordcloud.value) {
            if (!wordcloudInitialized) {
                const theWordcloud = WordCloud(words, {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    size: d => d.size,
                    rotate: () => { return 0; },
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



interface WordCloudOptions {
    size?: (d: any) => number;
    word?: (d: any) => string;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    width?: number;
    height?: number;
    maxWords?: number;
    fontFamily?: string;
    fontScale?: number;
    fill?: string;
    padding?: number;
    rotate?: (d: any) => number | number;
    invalidation?: any;
}

function WordCloud(text: { text: string, size: number }[], options: WordCloudOptions = {}) {
    
    const {
        size = (d: any) => d.size,
        word = (d: any) => d.text,
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
    } = options;
    
    // the rest of your function
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
        .fontSize((d: { size: number; }) => Math.sqrt(d.size) * fontScale)
        .on("word", (word: {size: number; x: number; y: number; rotate: number; text: string}) => {
            const textGroup = g.append("g");
            textGroup.append("text")
                .datum({text: word.text, size: word.size})
                .attr("id", "text")
                .attr("font-size", word.size)
                .attr("fill", () => colors[Math.floor(Math.random() * colors.length)])
                .attr("transform", `translate(${word.x},${word.y}) rotate(${word.rotate})`)
                .attr("style", `animation-delay: ${Math.random() * 10}s`)
                .text(word.text);
        });

    cloud.start();
    invalidation && invalidation.then(() => cloud.stop());
    return svg.node();
}
</script>

<template>
  <div id="wordcloud" ref="wordcloud"></div>
</template>

