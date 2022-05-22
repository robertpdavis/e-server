const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// get all categories
router.get('/', async (req, res) => {
  // find all categories
  try {
    const categoryData = await Category.findAll({
      // JOIN with Product
      include: [{ model: Product }]
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one category
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      // JOIN with Product
      include: [{ model: Product }]
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new category
router.post('/', async (req, res) => {
  try {
    /* req.body should look like this...
      {
        "category_name": "Sporting Goods"
      }
    */
    const category = await Category.create(req.body);
    res.status(200).json(category);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update category
router.put('/:id', async (req, res) => {
  try {
    // update category data
    const category = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json(category);
  } catch (err) {
    // console.log(err);
    res.status(400).json(err);
  }
});

// delete category
router.delete('/:id', async (req, res) => {
  // delete one category by its `id` value
  try {
    const category = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!category) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
