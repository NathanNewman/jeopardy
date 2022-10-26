// Global Variables used
const numCat = 6;
const numClues = 5;
const categories = [];
let setupReady = false;
let startButtonClicked = false;

// gets an array of category ids from API
async function getCategoryIds() {
  const catArray = [];
  response = await axios.get("https://jservice.io/api/categories?count=100");
  for (index of response.data) {
    catArray.push(index.id);
  }
  return catArray;
}

// uses category ids to get category data from API
async function getCategory(catId) {
  const response = await axios.get(
    `https://jservice.io/api/category?id=${catId}`
  );
  const cat = response.data;
  const allClues = cat.clues;
  const numClues = cat.clues_count;

  // removes categories that don't have enough clues for game
  if (numClues < 5) {
    return null;
  }

  // randomizes clues by shuffling allClues array
  for (let i = allClues.length - 1; i > 0; i--) {
    const randNum = Math.floor(Math.random() * (i + 1));
    const temp = allClues[i];
    allClues[i] = allClues[randNum];
    allClues[randNum] = temp;
  }
  // creates an array of 5 clues from randomized allClues array
  const clues = [];
  for (let i = 0; i < 5; i++) {
    clues.push(allClues[i]);
  }

  return { title: cat.title, clues };
}

// creates and displays the game board
async function fillTable() {
  // add row containing categories in table head
  const tableHeadRow = $("<tr>");
  for (let catIdx = 0; catIdx < numCat; catIdx++) {
    tableHeadRow.append($("<th>").text(categories[catIdx].title));
  }
  $("#jeopardy thead").append(tableHeadRow);

  // add question rows in table body
  for (let clueIdx = 0; clueIdx < numClues; clueIdx++) {
    const tableBodyRow = $("<tr>");
    const clueValue = (clueIdx + 1) * 200;
    for (let catIdx = 0; catIdx < numCat; catIdx++) {
      tableBodyRow.append(
        $("<td>")
          .attr("id", `${catIdx}-${clueIdx}`)
          .append(`<h3>$${clueValue}</h3>`)
      );
    }
    $("#jeopardy tbody").append(tableBodyRow);
  }
}

// Click event for gameboard
function clickEvent(targetId) {
  const id = targetId.split("-");
  const catId = id[0];
  const clueId = id[1];
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return;
  }

  // Update text of cell
  $(`#${catId}-${clueId}`).html(msg);
}

$("tbody").on("click", function(evt){
  target = evt.target;
  targetId = target.closest("td").id;
  return clickEvent(targetId);
});

// $("tbody").on("click", "h3", function (evt) {
//   target = evt.target;
//   console.log(target);
//   // clickEvent(parent);
// });

function showLoadingView() {
  $("iframe").show();
}

function hideLoadingView() {
  $("iframe").hide();
}

async function shuffle(catIds) {
  const shuffleCategories = [];

  // populates shuffleCategories Array
  for (let catId of catIds) {
    const categoryId = await getCategory(catId);
    if (categoryId !== null) {
      shuffleCategories.push(categoryId);
    }
  }

  // randomizes shuffleCategories array
  for (let i = shuffleCategories.length - 1; i > 0; i--) {
    const randNum = Math.floor(Math.random() * (i + 1));
    const temp = shuffleCategories[i];
    shuffleCategories[i] = shuffleCategories[randNum];
    shuffleCategories[randNum] = temp;
  }

  // pushes shuffleCategories array into categories array
  for (let catId of shuffleCategories) {
    categories.push(catId);
  }
}

async function setupAndStart() {
  const catIds = await getCategoryIds();
  await shuffle(catIds);
  hideLoadingView();
  fillTable();
}

$("#start-game").on("click", function () {
  $("#jeopardy thead").empty();
  $("#jeopardy tbody").empty();
  showLoadingView();

  if (startButtonClicked === false) {
    $("p").remove();
    $("#start-game").html("Restart Game");
    startButtonClicked = true;
    setupAndStart();
  } else {
    categories.splice(0, categories.length);
    setupReady = false;

    setupAndStart();
  }
});

hideLoadingView();

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
