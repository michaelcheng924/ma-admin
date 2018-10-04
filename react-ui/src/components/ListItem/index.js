import "./styles.css";
import React, { Component } from "react";

class ListItem extends Component {
  renderText(text) {
    const { search = "" } = this.props;

    const lowerSearch = search.toLowerCase();
    const lowerText = text.toLowerCase();

    const startIndex = lowerText.indexOf(lowerSearch);

    if (startIndex === -1) {
      return text;
    }

    const first = text.slice(0, startIndex);
    const highlight = text.slice(startIndex, startIndex + search.length);
    const last = text.slice(startIndex + search.length);

    return (
      <span>
        {first}
        <span className="highlight">{highlight}</span>
        {last}
      </span>
    );
  }

  render() {
    const {
      added,
      showUrl,
      subtitle,
      imageUrlSmall,
      tags = [],
      title,
      updated,
      url
    } = this.props;

    return (
      <div className="list-item">
        <div>
          <div className="answer-title">{this.renderText(title)}</div>
          <div className="list-item__subtitle">{this.renderText(subtitle)}</div>
          <div className="list-item__tags">
            <strong>Tags: </strong>
            {this.renderText(tags.join(", "))}
          </div>
          <div className="list-item__date">
            {updated ? `Updated: ${updated}` : added ? `Added: ${added}` : null}
          </div>
          {showUrl ? <div className="url">{url}</div> : null}
        </div>
        <div className="answer-image-container">
          <img className="answer-image" src={imageUrlSmall} alt={title} />
        </div>
      </div>
    );
  }
}

export default ListItem;
