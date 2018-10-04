import { each } from "lodash";

function getStructuredPosts(posts) {
  let result = posts.reduce((result, post) => {
    const { root, category } = post;

    if (!result[root.url]) {
      result[root.url] = {
        heading: root.heading,
        url: root.url,
        categories: {}
      };
    }

    if (!result[root.url].categories[category.url]) {
      result[root.url].categories[category.url] = {
        category: category.category,
        url: category.url,
        posts: []
      };
    }

    const categoryPosts = result[root.url].categories[category.url].posts;

    categoryPosts.push(post);

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
