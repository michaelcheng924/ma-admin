import "./styles.css";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { find, isArray, map, partial } from "lodash";
import Textarea from "react-textarea-autosize";
import AceEditor from "react-ace";

import { ReadingContainer } from "../Writing";

import "brace/mode/html";
import "brace/theme/github";

export default class PostDetail extends Component {
  constructor(props) {
    super(props);

    const { location, posts } = this.props;

    const searchUrl = location.search.split("url=")[1];

    const post =
      find(posts, postData => {
        return postData.url === searchUrl;
      }) || {};

    const modifiedPost = {
      ...post,
      category: isArray(post.category) ? post.category : [post.category]
    };

    const categoriesWithOrder = modifiedPost.category.map(categoryData => {
      return find(props.categoriesWithOrder, categoryWithOrder => {
        return categoryWithOrder.category.url === categoryData.url;
      }).category;
    });

    this.state = {
      categoriesWithOrder,
      post: modifiedPost,
      newCategory: {
        url: "",
        category: ""
      }
    };
  }

  getContentWithReferences() {
    let { content, references } = this.state.post;

    if (!references || !references[0]) {
      return content;
    }

    const matches = content.match(/\[[0-9]+\]/g);

    content = matches.reduce((result, match, index) => {
      const number = index + 1;

      return result.replace(
        match,
        `<span class="superscript"><a href="#footnote-${number}" id="text-${number}">[${number}]</a></span>`
      );
    }, content);

    return `
      ${content}

      <div class="writing">
        <h4>References</h4>

        <ol class="first">
          ${references
            .map((reference, index) => {
              const number = index + 1;

              return `<li><a class="reference-arrow" href="#text-${number}" id="footnote-${number}">^</a> ${reference}</li>`;
            })
            .join("\n")}
        </ol>
      </div>
    `;
  }

  onChange = event => {
    let post = this.state.post;
    const { structuredPosts } = this.props;

    let { name, value } = event.target;

    if (name === "tags") {
      value = value.split(",");
    }

    if (name === "references") {
      value = value.split("\n");
    }

    if (name === "root") {
      const root = structuredPosts[value];

      value = {
        url: root.url,
        heading: root.heading
      };
    }

    if (name === "index") {
      value = Number(value);
    }

    post[name] = value;

    this.setState({ post });
  };

  onContentChange = text => {
    let post = this.state.post;

    post.content = text;

    this.setState({ post });
  };

  onNewCategoryChange = event => {
    const { name, value } = event.target;
    let { newCategory } = this.state;

    newCategory[name] = value;

    this.setState({ newCategory });
  };

  onChangeCategory = (index, event) => {
    const { post } = this.state;
    const { structuredPosts } = this.props;

    let value = event.target.value;

    const foundCategory = structuredPosts[post.root.url].categories[value];

    if (foundCategory) {
      value = {
        url: foundCategory.url,
        category: foundCategory.category
      };
    } else {
      value = this.state.newCategory;
    }

    post.category[index] = value;

    this.setState({ post });
  };

  onReferenceChange = (index, event) => {
    const post = this.state.post;
    post.references[index] = event.target.value;

    this.setState({ post });
  };

  onOrderChange = (category, postData, currentIndex, event) => {
    let { categoriesWithOrder } = this.state;

    let matchedCategory = find(
      categoriesWithOrder,
      categoryData => categoryData.category === category.category
    );

    matchedCategory.posts.splice(currentIndex, 1);

    matchedCategory.posts.splice(event.target.value, 0, postData);

    matchedCategory.posts = matchedCategory.posts.map((post, index) => {
      return {
        ...post,
        index
      };
    });

    this.setState({ categoriesWithOrder });
  };

  validate() {
    const { post } = this.state;

    let validated = true;

    const keys = [
      "id",
      "title",
      "subtitle",
      "imageUrl",
      "imageUrlSmall",
      "url",
      "content",
      "tags"
    ];

    keys.forEach(key => {
      if (!post[key]) {
        validated = false;
      }
    });

    return validated;
  }

  onUpdate(url) {
    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      const { getPosts } = this.props;

      let { categoriesWithOrder, post } = this.state;
      post.post = undefined;

      axios
        .post(
          url,
          {
            categoriesWithOrder,
            post
          },
          this.props.getHeaders()
        )
        .then(response => {
          if (response.data.success) {
            window.alert("Update successful!");
            getPosts();
          }
        });
    }
  }

  updatePost = () => {
    this.onUpdate("/api/admin/updatepost");
  };

  updateStaging = () => {
    this.onUpdate("/api/admin/updatestaging");
  };

  renderRoots() {
    const { root } = this.state.post;
    const { structuredPosts } = this.props;

    return (
      <div>
        <h3>Root</h3>
        <select name="root" onChange={this.onChange} value={root.url}>
          {map(structuredPosts, root => {
            return (
              <option key={root.url} value={root.url}>
                {root.heading}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  renderCategories() {
    const { categoriesWithOrder, post, newCategory } = this.state;
    const { category, root } = post;
    const { structuredPosts } = this.props;

    const categories = structuredPosts[root.url].categories;

    return (
      <div>
        <h3>Categories</h3>
        {category.map((categoryData, index) => {
          return (
            <select
              key={categoryData.url}
              name="category"
              onChange={partial(this.onChangeCategory, index)}
              value={categoryData.url}
            >
              {map(categories, existingCategory => {
                return (
                  <option
                    key={existingCategory.url}
                    value={existingCategory.url}
                  >
                    {existingCategory.category}
                  </option>
                );
              })}
              <option value={newCategory.url}>{newCategory.category}</option>
            </select>
          );
        })}
        <br />
        <select
          name="category"
          onChange={partial(this.onChangeCategory, category.length)}
          value=""
        >
          <option value="">Add category</option>
          {map(categories, existingCategory => {
            return (
              <option key={existingCategory.url} value={existingCategory.url}>
                {existingCategory.category}
              </option>
            );
          })}
          <option value={newCategory.url}>{newCategory.category}</option>
        </select>
        <br />
        <div>
          <input
            placeholder="New cateogry URL"
            name="url"
            onChange={this.onNewCategoryChange}
            value={newCategory.url}
          />
        </div>
        <div>
          <input
            placeholder="New category category"
            name="category"
            onChange={this.onNewCategoryChange}
            value={newCategory.category}
          />
        </div>
        <br />
        {categoriesWithOrder.map(categoryData => {
          return (
            <div key={categoryData.category}>
              <div>
                <strong>{categoryData.category}</strong>
              </div>
              {categoryData.posts.map((postData, index) => {
                return (
                  <div key={postData.id}>
                    <select
                      value={index}
                      onChange={partial(
                        this.onOrderChange,
                        categoryData,
                        postData,
                        index
                      )}
                    >
                      {categories[categoryData.url].posts.map((item, index) => {
                        return (
                          <option key={index} value={index}>
                            {index}
                          </option>
                        );
                      })}
                    </select>
                    <span>{postData.title}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  renderContent() {
    const contentWithReferences = this.getContentWithReferences();

    return (
      <div className="post-detail__content-container">
        <AceEditor
          mode="html"
          theme="github"
          name="htmlcontent"
          onChange={this.onContentChange}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          value={this.state.post.content}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2
          }}
          editorProps={{
            $blockScrolling: Infinity
          }}
          wrapEnabled
        />
        <div
          className="post-detail__content-styled"
          dangerouslySetInnerHTML={{ __html: contentWithReferences }}
        />
      </div>
    );
  }

  render() {
    const {
      id,
      title,
      subtitle,
      imageUrl,
      imageUrlSmall,
      url,
      added,
      updated,
      tags = [],
      references = []
    } = this.state.post;

    return (
      <div>
        <ReadingContainer>
          <Link to="/">Home</Link>
          <div>
            {map(this.state.post, (value, key) => {
              if (key === "content") {
                return null;
              }
              return (
                <div key={key}>
                  <strong>{key}: </strong>
                  {JSON.stringify(value)}
                </div>
              );
            })}
          </div>
          <br />
          <div>
            {this.state.categoriesWithOrder.map(item => {
              return (
                <div key={item.category}>
                  <div>
                    <strong>{item.category}</strong>
                  </div>
                  {item.posts.map((post, index) => {
                    return (
                      <div key={post.title}>
                        {index} | {post.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <h4>{id}</h4>
          <div className="post-detail">
            {this.renderRoots()}
            {this.renderCategories()}
            <Textarea
              className="post-detail__title"
              value={title}
              onChange={this.onChange}
              name="title"
              placeholder="Title"
            />
            <Textarea
              className="post-detail__subtitle"
              value={subtitle}
              onChange={this.onChange}
              name="subtitle"
              placeholder="Subtitle"
            />
            <Textarea
              value={imageUrl}
              onChange={this.onChange}
              name="imageUrl"
              placeholder="Image URL"
            />
            <img
              src={imageUrl}
              style={{ height: 150, marginBottom: 20 }}
              alt={title}
            />
            <Textarea
              value={imageUrlSmall}
              onChange={this.onChange}
              name="imageUrlSmall"
              placeholder="Image URL Small"
            />
            <img
              src={imageUrlSmall}
              style={{ height: 80, marginBottom: 20 }}
              alt={title}
            />
            <Textarea
              value={url}
              onChange={this.onChange}
              name="url"
              placeholder="URL"
            />
            <Textarea
              value={added}
              onChange={this.onChange}
              name="added"
              placeholder="Added"
            />
            <Textarea
              value={updated}
              onChange={this.onChange}
              name="updated"
              placeholder="Updated"
            />
            <Textarea
              value={tags.join(",")}
              onChange={this.onChange}
              name="tags"
              placeholder="Tags"
            />
          </div>
        </ReadingContainer>

        {this.renderContent()}

        <div className="post-detail">
          <ReadingContainer>
            <Textarea
              value={references.join("\n")}
              onChange={this.onChange}
              name="references"
              placeholder="References"
            />
            {references.map((reference, index) => {
              return <div key={reference}>{`${index + 1}. ${reference}`}</div>;
            })}
          </ReadingContainer>
        </div>

        <div className="post-detail__save-buttons">
          <button onClick={this.updatePost}>Update Posts</button>
          <button onClick={this.updateStaging}>Update Staging</button>
        </div>
      </div>
    );
  }
}
