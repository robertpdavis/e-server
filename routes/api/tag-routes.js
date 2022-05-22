const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// get all tags
router.get('/', async (req, res) => {
  // find all tags
  try {
    const tagData = await Tag.findAll({
      // JOIN with Product through ProductTag
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      // JOIN with Product through ProductTag
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new tag
router.post('/', async (req, res) => {
  try {
    /* req.body should look like this...
      {
        "tag_name": "Orange",
      }
    */
    const tag = await Tag.create(req.body);
    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update tag
router.put('/:id', async (req, res) => {
  try {
    // update tag data
    const tag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json(tag);
  } catch (err) {
    // console.log(err);
    res.status(400).json(err);
  }
});

// delete tag
router.delete('/:id', async (req, res) => {
  // delete one tag by its `id` value
  try {
    const tag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
