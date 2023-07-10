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
const card1 = document.getElementById("card-1");
const card2 = document.getElementById("card-2");
const card3 = document.getElementById("card-3");
const card4 = document.getElementById("card-4");

// Intro logo fade out
card2.style.display = "none";
card3.style.display = "none";
card4.style.display = "none";

// Show card 2 after 2000ms
setTimeout(function () {
  card1.style.display = "none";
  card2.style.display = "block";
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

document.getElementById("add-btn").addEventListener("click", function (event) {
  event.preventDefault();

  const recipeNameInput = document.getElementById("recipeName");
  const recipeImageInput = document.getElementById("recipeImage");

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

function loadRecipes() {
  // Retrieve recipes from the database
  onValue(recipesInDB, function (snapshot) {
    const recipes = snapshot.val();
    console.log(recipes);
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

        newRecipeDiv.appendChild(recipeNameSpan);
        gridContainer.appendChild(newRecipeDiv);

        let timeoutID;

        newRecipeDiv.addEventListener("mousedown", function () {
          timeoutID = setTimeout(function () {
            // Remove the recipe when long press event occurs
            removeRecipe(recipe, key);
          }, 5000);
        });

        newRecipeDiv.addEventListener("mouseup", function () {
          clearTimeout(timeoutID);
        });

        newRecipeDiv.addEventListener("touchstart", function () {
          timeoutID = setTimeout(function () {
            // Remove the recipe when long press event occurs
            removeRecipe(recipe, key);
          }, 4000);
        });

        newRecipeDiv.addEventListener("touchend", function () {
          clearTimeout(timeoutID);
        });

        newRecipeDiv.addEventListener("click", function () {
          // Retrieve the ingredients for the clicked recipe
          const ingredientsList = document.getElementById("items");

          for (const ingredient of recipe.ingredients) {
            const listItem = document.createElement("li");
            listItem.textContent = ingredient;
            ingredientsList.appendChild(listItem);

            // Add click event listener to the ingredient list item
            listItem.addEventListener("click", function () {
              setTimeout(function () {
                listItem.classList.toggle("line-through");
              }, 100); // Add a small delay (e.g., 10 milliseconds)
            });
          }
        });
      }
    }
  });
}

function removeRecipe(recipe, recipeKey) {
  // Remove the recipe from the database
  remove(ref(database, `recipes/${recipeKey}`))
    .then(() => {
      console.log("Recipe removed from the database");
      loadRecipes(); // Reload recipes and update card-2
    })
    .catch((error) => {
      console.error("Error removing recipe from the database:", error);
    });
}

document
  .getElementById("remove-list-btn")
  .addEventListener("click", function () {
    const itemsList = document.getElementById("items");
    itemsList.innerHTML = ""; // Clear the shopping list
  });

  document.getElementById("emptyingredients-list-btn").addEventListener("click", function () {
    event.preventDefault();
    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";
  })

function clearFormInput() {
  // Clear the form fields
  const recipeNameInput = document.getElementById("recipeName");
  const recipeImageInput = document.getElementById("recipeImage");
  const ingredientInput = document.getElementById("ingredients");
  recipeNameInput.value = "";
  recipeImageInput.value = "";
  ingredientInput.value = "";
  const ingredientsList = document.getElementById("ingredients-list");
  ingredientsList.innerHTML = "";
}

loadRecipes();
