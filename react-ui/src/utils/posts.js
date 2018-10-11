import { each, isArray } from "lodash";

function getStructuredPosts(posts) {
  let result = posts.reduce((result, post) => {
    const { root, category } = post;

    const categoryArray = isArray(category) ? category : [category];

    if (!result[root.url]) {
      result[root.url] = {
        heading: root.heading,
        url: root.url,
        categories: {}
      };
    }

    categoryArray.forEach(categoryData => {
      if (!result[root.url].categories[categoryData.url]) {
        result[root.url].categories[categoryData.url] = {
          category: categoryData.category,
          url: categoryData.url,
          posts: []
        };
      }

      const categoryPosts = result[root.url].categories[categoryData.url].posts;

      categoryPosts.push(post);
    });

    return result;
  }, {});

  each(result, rootData => {
    each(rootData.categories, categoryData => {
      categoryData.posts.sort((a, b) => {
        return a.index - b.index;
      });
    });
  });

  return result;
}

export { getStructuredPosts };
