import React, {useState, useEffect} from 'react';
//import TransitionCloud from './cloud';
import WordCloud from "react-d3-cloud";
import { Button, Row, Card, Select } from 'antd';
import tweets from '../data/tweets_mini.json';
import wordsjson from '../data/preprocessed.json';
import { scaleLinear } from 'd3-scale';
import { select, selectAll } from 'd3-selection';
import useD3Transition from "use-d3-transition";


import candidateswords from '../data/candidateswords.json'
const { Option } = Select;

//import {writeJsonFile} from 'write-json-file';

//console.log(getCandidatesWords(candidates));

// https://stackoverflow.com/questions/5072136/javascript-filter-for-objects

Object.filter = (obj, predicate) => 
                Object.assign(...Object.keys(obj)
                    .filter( key => predicate(obj[key]) )
                    .map( key => ({ [key]: obj[key] }) ) );

const partiesColors = {
    'ILE': '#F7F6CF',
    'PC': '#B6D8F2',
    'PEV': '#F4CFDF',
    'PRSD�\xa0': '#5784BA',
    'ILF': '#9AC8EB',
    'PDC': '#CCD4BF',
    'PPD': '#E7CBA9',
    'IND-PPD': '#EEBAB2',
    'IND': '#A15D98', 
    'POD': '#F5BFD2',
    'MAS': '#E5DB9C',
    'IND-PRSD': '#E6A57E', 
    'EVO': '#BEB4C5',
    'RD': '#218B82',
    'IND-RN': '#9AD9DB', 
    'IND-RN�\xa0': '#9AD9DB', 
    'IND-PI': '#2CCED2',
    'PH': '#F9968B', 
    'IND-EVO�\xa0': '#2CCED2', 
    'FRVS': '#7B92AA', 
    'UDI': '#F27348',
    'PL': '#F7CE76', 
    'RN': '#7B92AA',
    'DC': '#90CDC3',
    'IND-PH': '#B8A390', 
    'PS': '#8EA4C8'
}

const candidatesColors = {
    'gabrielboric': '#7B92AA',
    'ProvosteYasna': '#F5BFD2',
    'paulanarvaezo': '#218B82',
    'MaldonadoCurti': '#E6A57E',
    'joseantoniokast': '#F27348',
    'sebas0tiansichel': '#B6D8F2'
};

let partiesList = [];
for(let i in wordsjson) {
    if (wordsjson[i].length > 0){
        partiesList.push(<h2 id='partytag' class={i} style={{color: partiesColors[i]}}>{i}</h2>)
    }
}

let candidatesList = [];
for(let i in candidateswords) {
    candidatesList.push(<h2 id='partytag' class={i} style={{color: candidatesColors[i]}}>{i}</h2>)
}


const useless = [
    '', 'a', 'la', 'el', 'y', 'de', 'para', 'si', 'no', 'una', 'uno', 'un', 'las', 'es', 'los', 'al', 'por', 'lo',
    'del', 'que', 'con', 'su', 'en', 'se', 'rt', 'como', 'hay', 'les', 'todo'
]

const getWordValues = (arr) => {
    let temp_arr = arr.map((d) => {
        if (d.text !== undefined){
            //https://stackoverflow.com/questions/40102199/counting-words-in-javascript-and-push-it-into-an-object
            return d.text.replace(/[!\.,:;\?]/g, '').split(" ").reduce(function(count, word) {
                count[word] = count.hasOwnProperty(word) ? count[word] + 1 : 1;
            
                return count;
                }, {});
        } else {
            return [];
        }
    });
    // https://stackoverflow.com/questions/55874797/sum-values-of-matching-keys-in-array-of-objects/55874868
    let wordsCount = temp_arr.reduce((acc, statsFields) => {
        Object.entries(statsFields).forEach(([key, value]) => acc[key] = (acc[key] || 0) + value);
        return acc;
    }, {});
    
    return wordsCount;
};

const filterWords = (arr) => {
    const words = getWordValues(arr);    

    const filtered = Object.filter(words, count => count > 20);

    const keys = Object.keys(filtered);
    const values = Object.values(filtered);
    const result = [];
    const valueScale = scaleLinear().domain([0, Math.max(...values)]).range([1, 1000]);

    for(let i in keys){
        if (!useless.includes(keys[i].toLowerCase())){
            result.push({text: keys[i], value: valueScale(values[i]), rotate: Math.random() < 0.5 ? 0 : 90});
        }
    }
    return result;
}

const getWordsParties = (arr) => {
    
    const wordsParties = {};

    for(let i in arr){
        let tempWords = arr[i].text.replace(/[!\.,:;\?]/g, '').split(" ").reduce(function(count, word) {
            count[word] = count.hasOwnProperty(word) ? count[word] + 1 : 1;
            return count;
            }, {});

        if (wordsParties.hasOwnProperty(arr[i].partido)){
            // https://stackoverflow.com/questions/67390960/javascript-how-to-merge-two-objects-and-sum-the-values-of-the-same-key
            wordsParties[arr[i].partido] = Object.entries(tempWords).reduce((acc, [key, value]) => 
            // if key is already in map1, add the values, otherwise, create new pair
            ({ ...acc, [key]: (acc[key] || 0) + value })
        , { ...wordsParties[arr[i].partido]});
        } else {
            wordsParties[arr[i].partido] = tempWords;
        }
        
    }

    for (let i in wordsParties){
        const keys = Object.keys(wordsParties[i]);
        const values = Object.values(wordsParties[i]);
        const result = [];

        for(let i in keys){
            if (!useless.includes(keys[i].toLowerCase()) && values[i] > 20){
                result.push({text: keys[i], value: values[i], rotate: Math.random() < 0.5 ? 0 : 90});
            }
        }
        wordsParties[i] = result;
    }
    console.log(wordsParties);
    return wordsParties;
    
}

const getWordColors = (obj, colors, candidateName) => {
    const result = [];

    const keys = Object.keys(obj);
    for(let k in keys) {
        for(let i in obj[keys[k]]){
            let temp = obj[keys[k]][i];
            if (candidateName === null || candidateName === keys[k]) {
            result.push({text: temp.text, value: temp.value, 
                rotate: temp.rotate, fill: colors[keys[k]],
                partido: keys[k]})
            }
        }
    }
    if (result.length > 50){
        return result.slice(0, 50);
    } 
    return result;
}


//console.log(getWordColors(wordsjson, partiesColors));

// fs.writeFile('./myFile.json', JSON.stringify(getWordsParties(tweets)), (err) => {
//     if (err) console.log('Error writing file:', err);
// })

//writeJsonFile('preprocessed.json', getWordsParties(tweets));


const data_1 = getWordColors(wordsjson, partiesColors, null) //filterWords(tweets)
const data_2 = getWordColors(candidateswords, candidatesColors, 'joseantoniokast')

export default function CloudContainer() {

    const [dataset, setData] = useState(data_1);
    const [tagNames, setTagNames] = useState(partiesList);
    

    const handleChange = (value) => {
        setData(getWordColors(candidateswords, candidatesColors, value))
    }
    const change = {state: 0};

    //const wordScale = rd3.Scale.Linear().range([10, 60]);

    const fontSizeMapper = (word) => {
        return word.value//wordScale(Math.log2(word.value) * 5);
    };
    const rotate = (word) => word.rotate;

    const mouseOver = (event) => {
        selectAll('text')
            .data(dataset)
            .transition()
            .duration(500)
            .attr('opacity', (d) => {
                console.log(event.target.className)

                if(d.partido && event.target.className.baseVal === d.partido){
                    return 1;
                } else {
                    return 0.5;
                }
            });
        
    }

    const mouseLeave = (event) => {
        selectAll('text')
            .transition()
            .duration(500)
            .attr('opacity', 1);
    }

    const cloud = <WordCloud data={dataset} fontSizeMapper={fontSizeMapper} rotate={rotate} font={'Impact'}
                    onWordMouseOver={mouseOver} onWordMouseOut={mouseLeave}
                    width={500} height={500}/>
    
    useEffect(()=>{
        selectAll('text')
            .data(dataset)
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .style('fill', (d) => {
                return d.fill;
            }) 
            .attr('class', (d) => d.partido)
            .transition()
            .duration(500)
            .attr('opacity', 1)
        })
        

    return(
        <div>
            {/* <TransitionCloud data={data_1} fontSizeMapper={fontSizeMapper} rotate={rotate} /> */}
            <Row>
                {cloud}

                
                <Card>
                    {tagNames}
                </Card>
            </Row>
            <Button
                    type="primary"
                    size="large"
                    onClick={() => {if(change.state === 1){
                                        selectAll('text')
                                            .transition()
                                            .duration(500)
                                            .attr('opacity', 0)
                                        setData(data_1);
                                        setTagNames(partiesList)
                                        change.state = 0;
                                    } else {
                                        selectAll('text')
                                            .transition()
                                            .duration(500)
                                            .attr('opacity', 0)
                                        setData(data_2);
                                        setTagNames(candidatesList)
                                        change.state = 1;
                                    };
                    }}
                    style={{
                      backgroundColor: "blue",
                      textAlign: "center",
                      marginTop: "10px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      color: "white"
                    }}
                    danger
                  >
                    Cambiar Data
                  </Button>
                <Select defaultValue="gabrielboric" style={{ width: 200 }} onChange={handleChange}>
                    <Option value="ProvosteYasna">gabrielboric</Option>
                    <Option value="ProvosteYasna">ProvosteYasna</Option>
                    <Option value="paulanarvaezo">paulanarvaezo</Option>
                    <Option value="joseantoniokast">
                    joseantoniokast
                    </Option>
                    <Option value="sebas0tiansichel">yiminghe</Option>
                </Select>
        </div>
    )
}
