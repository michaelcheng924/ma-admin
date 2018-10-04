import "./styles.css";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { find, map } from "lodash";
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

    this.state = {
      post,
      newCategory: {
        url: "",
        category: ""
      }
    };
  }

  onChange = event => {
    let post = this.state.post;
    const { structuredPosts } = this.props;

    let { name, value } = event.target;

    if (name === "tags") {
      value = value.split(",");
    }

    if (name === "root") {
      const root = structuredPosts[value];

      value = {
        url: root.url,
        heading: root.heading
      };
    }

    if (name === "category") {
      const category = structuredPosts[post.root.url].categories[value];

      value = {
        url: category.url,
        category: category.category
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

      let post = this.state.post;
      post.post = undefined;

      axios
        .post(
          url,
          {
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
    console.log(this.state.post);
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
        <input
          type="number"
          name="index"
          value={index}
          onChange={this.onChange}
        />
        <br />
        <br />
      </div>
    );
  }

  renderReferences() {
    const { references = [] } = this.state.post;

    return (
      <div className="post-detail__references">
        <h4>References</h4>
        {references.map((reference, index) => {
          return <Textarea value={reference} placeholder={index + 1} />;
        })}
        <Textarea placeholder={references.length + 1} />
      </div>
    );
  }

  renderContent() {
    const { content } = this.state.post;

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
          dangerouslySetInnerHTML={{ __html: content }}
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
      tags = []
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
            {this.renderReferences()}
          </div>
        </ReadingContainer>

        {this.renderContent()}

        <div className="post-detail__save-buttons">
          <button onClick={this.updatePost}>Update Posts</button>
          <button onClick={this.updateStaging}>Update Staging</button>
        </div>
      </div>
    );
  }
}
