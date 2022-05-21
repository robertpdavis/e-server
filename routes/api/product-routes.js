const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      // JOIN with Category and Tag through ProductTag
      include: [{ model: Category }, { model: Tag, through: ProductTag, as: 'tags' }]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      // JOIN with Category and Tag through ProductTag
      include: [{ model: Category }, { model: Tag, through: ProductTag, as: 'tags' }]
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    /* req.body should look like this...
      {
        "product_name": "Boots",
        "price": 200.00,
        "stock": 5,
        "category_id": 5,
        "tagIds": [3, 4, 5, 6]
      }
    */
    const product = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      res.status(200).json({ product, "TagIds": productTagIds });
    } else {
      // if no product tags, just respond
      res.status(200).json(product);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    const product = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    // get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    // create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // run both actions
    const removedTags = await ProductTag.destroy({ where: { id: productTagsToRemove } });
    const updatedProductTags = await ProductTag.bulkCreate(newProductTags);
    if (Object.keys(updatedProductTags).length != 0) {
      res.status(200).json({ product, "TagIds": updatedProductTags });
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    // console.log(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const product = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
