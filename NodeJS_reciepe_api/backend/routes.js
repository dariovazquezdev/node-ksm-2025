const express = require("express");
const router = express.Router();
let { db } = require("./database.js");

const RECIPE_REQUIRED_FIELDS = [
  'name',
  'category',
  'instructions',
  'ingredients',
  'prep_time',
];
const MEAL_PLAN_REQUIRED_FIELDS = [
  "name",
  "date",
  "recipe_ids",
  "notes",
];

const validateRequiredFields = (requiredFields) => (req, res, next) => {
  const validatedFields = {};
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ error: `Missing required field: ${field}` });
    }
    validatedFields[field] = req.body[field];
  }
  req.validatedFields = { ...validatedFields };
  next();
}

const databaseError = (res) =>
  res.status(500).json({ error: 'Database Error' });

/*
GET @ /api/recipes
Returns all recipes with optional category filtering
Query Parameters:
- category: (optional) Filter recipes by category (e.g., breakfast, lunch, dinner)
Expected format:
  [
    {
        "id": 1,
        "name": "Pasta Carbonara",
        "category": "dinner",
        "instructions": "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine with pasta.",
        "ingredients": "Pasta, Eggs, Cheese, Bacon",
        "prep_time": 30
    },
    .
    .
  ]
*/
router.get('/recipes', (req, res) => {
  const { category } = req.query;
  const params = [];

  let query = 'SELECT * FROM recipes';
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return databaseError(res);
    }
    return res.json(rows);
  });
});

/*
GET @ /api/recipes/id
Returns single recipe
Expected Format:
    {
        "id": 1,
        "name": "Pasta Carbonara",
        "category": "dinner",
        "instructions": "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine with pasta.",
        "ingredients": "Pasta, Eggs, Cheese, Bacon",
        "prep_time": 30
    }
NOTE: If the recipe with id is not found, return status 404 with message 'Recipe not found'
*/
router.get('/recipes/:id', (req, res) => {
  //Your code goes here
  const { id } = req.params;
  const params = [id];
  db.get('SELECT * FROM recipes WHERE id = ?', params, (err, row) => {
    if (err) {
      return databaseError(res);
    }
    if (!row) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    return res.json(row);
  })
});

/*
POST @ /api/recipes
Add a new recipe
Req body Example:
echo '{
    "name": "Avocado Toast",
    "category": "breakfast",
    "instructions": "1. Toast bread. 2. Mash avocado. 3. Spread on toast. 4. Season.",
    "ingredients": "Bread, Avocado, Salt, Pepper, Lemon juice",
    "prep_time": 10
}' | http POST http://localhost:8000/api/recipes
Response:
{
    "message": "Recipe added successfully",
    "recipe":
        {
            "id": 3,
            "name": "Avocado Toast",
            "category": "breakfast",
            "instructions": "1. Toast bread. 2. Mash avocado. 3. Spread on toast. 4. Season.",
            "ingredients": "Bread, Avocado, Salt, Pepper, Lemon juice",
            "prep_time": 10
        }
}
*/
router.post('/recipes', validateRequiredFields(RECIPE_REQUIRED_FIELDS), (req, res) => {
  const newRecipe = req.validatedFields;
  const query = `
    INSERT INTO recipes (${Object.keys(newRecipe).join(',')})
    VALUES (${Object.keys(newRecipe).map(() => '?').join(',')})
  `;
  db.run(query, Object.values(newRecipe), function (err) {
    if (err) {
      return databaseError(res);
    }
    return res.status(200).json({
      message: "Recipe added successfully",
      recipe: {
        "id": this.lastID,
        ...newRecipe,
      }
    });
  });
});

/*
POST @ /api/meal-plans
Create a new meal plan
Req body Example:
echo '{
    "name": "Week of June 5",
    "date": "2023-06-05",
    "recipe_ids": "[1, 2]",
    "notes": "Focus on quick meals this week"
}' | http POST http://localhost:8000/api/meal-plans
Response:
{
    "message": "Meal plan created successfully",
    "meal_plan":
        {
            "id": 1,
            "name": "Week of June 5",
            "date": "2023-06-05",
            "recipe_ids": "[1,2]",
            "notes": "Focus on quick meals this week"
        }
}
*/
router.post('/meal-plans', validateRequiredFields(MEAL_PLAN_REQUIRED_FIELDS), (req, res) => {
  const newMealPlan = req.validatedFields;
  const query = `
    INSERT INTO meal_plans (${Object.keys(newMealPlan).join(',')})
    VALUES (${Object.keys(newMealPlan).map(() => '?').join(',')})
  `;
  db.run(query, Object.values(newMealPlan), function (err) {
    if (err) {
      return databaseError(res);
    }
    return res.status(200).json({
      message: "Meal plan created successfully",
      meal_plan: {
        "id": this.lastID,
        ...newMealPlan,
      }
    });
  });
});

/*
GET @ /api/meal-plans
Returns all meal plans
Expected format:
  [
    {
        "id": 1,
        "name": "Week of June 5",
        "date": "2023-06-05",
        "recipe_ids": "[1,2]",
        "notes": "Focus on quick meals this week"
    },
    .
    .
  ]
*/
router.get('/meal-plans', (req, res) => {
  db.all('SELECT * FROM meal_plans', (err, rows) => {
    if (err) {
      return databaseError(res);
    }
    return res.json(rows);
  });
});

/*
DELETE @ api/meal-plans/id
Delete a meal plan
Response:
{
    "message": "Meal plan deleted successfully"
}
NOTE: If the meal plan with id is not found, return status 400 with error message.
*/
router.delete('/meal-plans/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM meal_plans WHERE id = ?', [id], function(err) {
    if (err) {
      return databaseError();
    }
    if (this.changes === 0) {
      return res.status(400).json({ message: 'Meal plan not found' });
    }
    return res.status(200).json({ message: 'Meal plan deleted successfully' });
  })
});

module.exports = router;
