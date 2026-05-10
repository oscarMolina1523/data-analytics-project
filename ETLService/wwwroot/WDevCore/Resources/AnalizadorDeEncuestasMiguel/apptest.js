import { data } from "./datos.js";

import { ColumChart, RadialChart } from "../WComponents/WChartJSComponents.js";

function processFormResponses(responses) {
    const result = {};

    // Iterar sobre cada respuesta
    responses.forEach(response => {
        for (const question in response) {
            if (question !== "Marca temporal" && response[question] != null &&  response[question] != undefined ) { // Ignorar la marca temporal
                const answers = response[question].toString().split(',').map(answer => answer.trim());

                answers.forEach(answer => {
                    result[question] = result[question] || {};
                    result[question][answer] = (result[question][answer] || 0) + 1;
                });
            }
        }
    });
    // Calcular porcentajes
    for (const question in result) {
        //const totalAnswers = Object.values(result[question]).reduce((acc, curr) => acc + curr, 0);
        const totalAnswers = responses.length;  
        for (const answer in result[question]) {
            const count = result[question][answer]
            const avg = count / totalAnswers * 100      
            result[question][answer] = {
                count: count,
                percentage: avg + '%'
            };
        }
    }

    return result;
}
function processFormResponses2(responses) {
    const result = {};
  
    // Iterar sobre cada respuesta
    responses.forEach(response => {
      for (const question in response) {
        if (question !== "Marca temporal" && response[question] != null && response[question] !== undefined) {
          const answers = response[question].toString().split(',').map(answer => answer.trim());
  
          answers.forEach(answer => {
            result[question] = result[question] || [];
            const existingAnswer = result[question].find(a => a.value === answer);
            if (existingAnswer) {
              existingAnswer.count++;
            } else {
              result[question].push({ value: answer, count: 1, percentage: 0 });
            }
          });
        }
      }
    });
  
    // Calcular porcentajes
    for (const question in result) {
      const totalAnswers = responses.length;
      result[question].forEach(answer => {
        answer.percentage = ((answer.count / totalAnswers) * 100).toFixed(2) + '%';
      });
    }
  
    const formattedResult = Object.entries(result).map(([question, answers]) => ({
      question,
      answers
    }));
  
    return formattedResult;
}
const result = processFormResponses2(data);
console.log(result);
result.forEach(res => {
    app.append(new ColumChart({
        Title: res.question,
        Dataset: res.answers,
        //AttNameEval: "value",
        percentCalc: true,
        MaxVal : 322,
        EvalValue: "count",
        groupParams: ["value"]
    })),
    app.append(new RadialChart({
      Title: res.question,
      Dataset: res.answers,
      //AttNameEval: "value",
      percentCalc: true,
      MaxVal : 322,
      EvalValue: "count",
      AttNameEval: "value"
  }))
})

