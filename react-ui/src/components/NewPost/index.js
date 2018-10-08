import "./styles.css";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { map } from "lodash";
import Textarea from "react-textarea-autosize";
import AceEditor from "react-ace";

import { ReadingContainer } from "../Writing";

import "brace/mode/html";
import "brace/theme/github";

export default class NewPost extends Component {
  constructor(props) {
    super(props);

    const rootData =
      props.structuredPosts[Object.keys(props.structuredPosts)[0]];

    const categoryData =
      rootData.categories[Object.keys(rootData.categories)[0]];

    this.state = {
      post: {
        title: "",
        subtitle: "",
        imageUrl: "",
        url: "",
        added: "",
        updated: "",
        tags: [],
        content: "",
        references: [],
        root: {
          url: rootData.url,
          heading: rootData.heading
        },
        category: {
          url: categoryData.url,
          category: categoryData.category
        }
      },
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

    if (matches) {
      content = matches.reduce((result, match, index) => {
        const number = index + 1;

        return result.replace(
          match,
          `<span class="superscript"><a href="#footnote-${number}" id="text-${number}">[${number}]</a></span>`
        );
      }, content);
    }

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

      const newCategory = root.categories[Object.keys(root.categories)[0]];

      post.category = {
        url: newCategory.url,
        category: newCategory.category
      };
    }

    if (name === "category") {
      const category = structuredPosts[post.root.url].categories[value];

      if (category) {
        value = {
          url: category.url,
          category: category.category
        };
      } else {
        value = this.state.newCategory;
      }
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

  validate() {
    const { post } = this.state;

    let validated = true;

    const keys = [
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

  onCreate(url) {
    if (!this.validate()) {
      window.alert("Missing fields");
      return;
    }

    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      const { getPosts } = this.props;

      axios
        .post(
          url,
          {
            post: this.state.post
          },
          this.props.getHeaders()
        )
        .then(response => {
          if (response.data.success) {
            window.alert("Create successful!");
            getPosts().then(() => {
              this.props.history.push(`/postdetail?url=${this.state.post.url}`);
            });
          }
        });
    }
  }

  createPost = () => {
    this.onCreate("/api/admin/createpost");
  };

  createStaging = () => {
    this.onCreate("/api/admin/createstaging");
  };

  renderRoots() {
    const { root } = this.state.post;
    const { structuredPosts } = this.props;

    return (
      <select name="root" onChange={this.onChange} value={root.url}>
        {map(structuredPosts, root => {
          return (
            <option key={root.url} value={root.url}>
              {root.heading}
            </option>
          );
        })}
      </select>
    );
  }

  renderCategories() {
    const { post, newCategory } = this.state;
    const { category, index, root } = post;
    const { structuredPosts } = this.props;

    const categories = structuredPosts[root.url].categories;

    const categoryData = structuredPosts[root.url].categories[category.url];

    return (
      <div>
        <select name="category" onChange={this.onChange} value={category.url}>
          {map(categories, category => {
            return (
              <option key={category.url} value={category.url}>
                {category.category}
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
            placeholder="New cateogry category"
            name="category"
            onChange={this.onNewCategoryChange}
            value={newCategory.category}
          />
        </div>
        <br />
        {categoryData
          ? categoryData.posts.map(post => {
              return (
                <div key={post.url}>
                  {post.index} | {post.title}
                </div>
              );
            })
          : "No other posts in this category"}
        <br />
        <input name="index" value={index} onChange={this.onChange} />
        <br />
        <br />
      </div>
    );
  }

  renderContent() {
    const { content } = this.state.post;

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
          value={content}
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
      title,
      subtitle,
      imageUrl,
      imageUrlSmall,
      url,
      added,
      updated,
      tags = [],
      references
    } = this.state.post;

    return (
      <div>
        <ReadingContainer>
          <Link to="/">Home</Link>
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
          <button onClick={this.createPost}>Create Posts</button>
          <button onClick={this.createStaging}>Create Staging</button>
        </div>
      </div>
    );
  }
}
