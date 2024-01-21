// Firebase database setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://basketchef-application-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const recipesInDB = ref(database, "recipes");

//----------------------------------------------------------------------------------
const bookBtn = document.getElementById("book-btn");
const listBtn = document.getElementById("list-btn");
const addRecipeBtn = document.getElementById("add-recipe-btn");
const navBtns = document.getElementById("navigation-btns");
const card1 = document.getElementById("card-1");
const card2 = document.getElementById("card-2");
const card3 = document.getElementById("card-3");
const card4 = document.getElementById("card-4");
const container = document.querySelector(".container");

// Intro logo fade out
container.style.backgroundColor = "#202020";
card2.style.display = "none";
card3.style.display = "none";
card4.style.display = "none";
document.body.style.backgroundColor = "#202020";

// Navigation buttons
listBtn.style.display = "none"; // Hide the listBtn initially
bookBtn.style.display = "none"; // Hide the bookBtn initially
addRecipeBtn.style.display = "none"; // Hide the addRecipeBtn initially

setTimeout(function () {
  card1.style.display = "none";
  card2.style.display = "block";
  listBtn.style.display = "block";
  bookBtn.style.display = "block";
  addRecipeBtn.style.display = "block";
  navBtns.style.zIndex = "0";
  container.style.backgroundColor = "#f2f0ee";
  document.body.style.backgroundColor = "#e4b7a4";
}, 4000);

let currentCard = card2; // Initialize currentCard with a default value

// Navigation buttons
listBtn.addEventListener("click", function () {
  swapCards(currentCard, card3);
  currentCard = card3;
});

bookBtn.addEventListener("click", function () {
  swapCards(currentCard, card2);
  currentCard = card2;
});

addRecipeBtn.addEventListener("click", function () {
  swapCards(currentCard, card4);
  currentCard = card4;
});

function swapCards(currentCard, nextCard) {
  currentCard.style.display = "none";
  nextCard.style.display = "block";
}

//---------------------------------------------------------------------------------

//Adding new recipes
//Get recipe information from form fields

const ingredientBtn = document.getElementById("ingredient-btn");
const ingredientsList = document.getElementById("ingredients-list");

ingredientBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent form submission

  const ingredientInput = document.getElementById("ingredients");
  const ingredientValue = ingredientInput.value.trim();

  if (ingredientValue !== "") {
    const listItem = document.createElement("li");
    listItem.textContent = ingredientValue;
    ingredientsList.appendChild(listItem);

    ingredientInput.value = ""; // Clear the input field
  }
});

document
  .getElementById("confirm-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const recipeNameInput = document.getElementById("recipeName");
    const recipeImageInput = document.getElementById("imageUpload");

    const recipe = {
      name: recipeNameInput.value.trim(),
      ingredients: [], // Initialize the ingredients array
      imageURL: null, // Initialize the imageURL property
    };

    const ingredientsList = document.getElementById("ingredients-list");

    for (let i = 0; i < ingredientsList.children.length; i++) {
      const ingredient = ingredientsList.children[i].textContent.trim();
      recipe.ingredients.push(ingredient);
    }

    const file = recipeImageInput.files[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = function (event) {
        const imageURL = event.target.result;
        recipe.imageURL = imageURL;

        saveRecipeToDatabase(recipe);
        clearFormInput();
      };

      fileReader.readAsDataURL(file);
    } else {
      saveRecipeToDatabase(recipe);
      clearFormInput();
    }
  });

function saveRecipeToDatabase(recipe) {
  // Push the recipe object to the database
  push(recipesInDB, recipe)
    .then(() => {
      console.log("Recipe added to the database");
      loadRecipes(); // Reload recipes and update card-2
    })
    .catch((error) => {
      console.error("Error adding recipe to the database:", error);
    });
}

let selectedRecipes = [];

function loadRecipes() {
  // Retrieve recipes from the database
  onValue(recipesInDB, function (snapshot) {
    const recipes = snapshot.val();
    console.log("Recipes:", recipes);
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear the existing recipe elements

    for (const key in recipes) {
      if (Object.hasOwnProperty.call(recipes, key)) {
        const recipe = recipes[key];
        const newRecipeDiv = document.createElement("div");
        newRecipeDiv.classList.add("recipe");

        if (recipe.imageURL) {
          // If the recipe has an imageURL
          const backgroundImage = document.createElement("div");
          backgroundImage.classList.add("background-img");
          backgroundImage.style.backgroundImage = `url(${recipe.imageURL})`;
          newRecipeDiv.appendChild(backgroundImage);
        }

        const recipeNameSpan = document.createElement("span");
        recipeNameSpan.classList.add("recipe-name");
        recipeNameSpan.textContent = recipe.name;

        const xBtn = document.createElement("button");
        xBtn.classList.add("x-btn");
        xBtn.textContent = "Select";
        xBtn.style.display = "none";

        const removeRecipeBtn = document.getElementById("edit-recipe-list");

        // Define variables to track the button state
        let originalBackgroundColor = removeRecipeBtn.style.backgroundColor;
        let originalTextColor = removeRecipeBtn.style.color;

        // Assuming you have the grey-text element
        const greyTextElement = document.querySelector(".grey-text");
        const originalGreyText = greyTextElement.innerText; // Store the original text

        removeRecipeBtn.addEventListener("click", function () {
          if (xBtn.style.display === "none") {
            xBtn.style.display = "inline";
            removeRecipeBtn.style.backgroundColor = "#e4b7a4";
            removeRecipeBtn.style.color = "white";
            removeRecipeBtn.innerText = "Done";

            // Change the grey-text element when delete buttons are displayed
            greyTextElement.innerText =
              "Select a recipe to remove, then click Done";
          } else {
            // If delete buttons were displayed, remove selected recipes
            if (selectedRecipes.length > 0) {
              removeSelectedRecipes(selectedRecipes);
              selectedRecipes = []; // Clear the selected recipes array
            }

            xBtn.style.display = "none";
            removeRecipeBtn.innerText = "Edit";

            // Revert the grey-text element to its original state
            greyTextElement.innerText = originalGreyText;

            removeRecipeBtn.style.backgroundColor = originalBackgroundColor;
            removeRecipeBtn.style.color = originalTextColor;
          }
        });

        recipeNameSpan.appendChild(xBtn);
        newRecipeDiv.appendChild(recipeNameSpan);
        gridContainer.appendChild(newRecipeDiv);

        // Event listener for the remove button
        xBtn.addEventListener("click", function (event) {
          event.stopPropagation(); // Prevent event from propagating to the recipe div
          event.preventDefault();

          const recipeKey = key;

          // Toggle the selection status of the recipe
          const index = selectedRecipes.indexOf(recipeKey);
          if (index > -1) {
            selectedRecipes.splice(index, 1); // Remove from selected recipes
          } else {
            selectedRecipes.push(recipeKey); // Add to selected recipes
          }

          // Toggle the styling of the recipe element
          newRecipeDiv.classList.toggle("selected");
          if (xBtn.textContent === "Remove") {
            xBtn.textContent = "Select";
          } else {
            xBtn.textContent = "Remove";
          }
        });

        newRecipeDiv.addEventListener("click", function () {
          // Retrieve the ingredients for the clicked recipe
          const ingredientsList = document.getElementById("items");

          if (newRecipeDiv.classList.contains("recipe-clicked")) {
            // Remove the relevant ingredients from the shopping list
            for (const ingredient of recipe.ingredients) {
              const shoppingListItems = ingredientsList.querySelectorAll("li");
              for (const shoppingListItem of shoppingListItems) {
                if (shoppingListItem.textContent.trim() === ingredient) {
                  shoppingListItem.remove();
                }
              }
            }

            newRecipeDiv.classList.remove("recipe-clicked");
            newRecipeDiv.style.backgroundColor = "";
            recipeNameSpan.textContent = recipe.name;
            console.log(newRecipeDiv);
            newRecipeDiv.querySelector(".background-img").style.display =
              "block";
            recipeNameSpan.appendChild(xBtn);
          } else {
            // Add the ingredients to the shopping list
            for (const ingredient of recipe.ingredients) {
              const listItem = document.createElement("li");
              listItem.textContent = ingredient;
              ingredientsList.appendChild(listItem);

              // Add click event listener to the ingredient list item
              listItem.addEventListener("click", function () {
                setTimeout(function () {
                  listItem.classList.toggle("line-through");
                }, 100); // Add a small delay (e.g., 100 milliseconds)
              });
            }

            newRecipeDiv.classList.add("recipe-clicked");
            newRecipeDiv.style.backgroundColor = "#e6af70";
            recipeNameSpan.innerHTML = "Ingredients Added";
            newRecipeDiv.querySelector(".background-img").style.display =
              "none";
          }
        });
      }
    }
  });
}

// Add an event listener for the "Add Item" button in card-3
document.getElementById("addItemBtn").addEventListener("click", function () {
  const userItemInput = document.getElementById("userItem");
  const userItemValue = userItemInput.value.trim();

  if (userItemValue !== "") {
    const itemsList = document.getElementById("items");
    const listItem = document.createElement("li");
    listItem.textContent = userItemValue;
    itemsList.appendChild(listItem);

    // Add a class to distinguish user-added items
    listItem.classList.add("user-added-item");

    // Clear the input field
    userItemInput.value = "";
  }
});

// Event listener for the user-added items in the shopping list
document.getElementById("items").addEventListener("click", function (event) {
  const clickedItem = event.target;

  // Check if the clicked item is a user-added item
  if (clickedItem.classList.contains("user-added-item")) {
    // Toggle the line-through effect
    clickedItem.classList.toggle("line-through");
  }
});


function removeRecipe(recipeKey) {
  // Remove the recipe from the database
  console.log(recipeKey);
  remove(ref(database, `recipes/${recipeKey}`))
    .then(() => {
      console.log("Recipe removed from the database");
      loadRecipes(); // Reload recipes and update card-2
    })
    .catch((error) => {
      console.error("Error removing recipe from the database:", error);
    });
}

function removeSelectedRecipes(recipeKeys) {
  // Iterate over the array of selected recipe keys
  for (const recipeKey of recipeKeys) {
    // Remove each selected recipe
    removeRecipe(recipeKey);
  }
}

document
  .getElementById("remove-list-btn")
  .addEventListener("click", function () {
    const itemsList = document.getElementById("items");
    itemsList.innerHTML = "";
    loadRecipes();
  });

document
  .getElementById("emptyingredients-list-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";
  });

function clearFormInput() {
  // Clear the form fields
  const recipeNameInput = document.getElementById("recipeName");
  const recipeImageInput = document.getElementById("imageUpload");
  const ingredientInput = document.getElementById("ingredients");
  recipeNameInput.value = "";
  recipeImageInput.value = "";
  ingredientInput.value = "";
  const ingredientsList = document.getElementById("ingredients-list");
  ingredientsList.innerHTML = "";
}

loadRecipes();
