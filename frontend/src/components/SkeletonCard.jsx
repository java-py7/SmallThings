import "../styles/Marketplace.css";

function SkeletonCard() {

    return (

        <div className="item-card skeleton-card">

            <div className="skeleton-image shimmer"></div>

            <div className="item-content">

                <div className="skeleton-title shimmer"></div>

                <div className="skeleton-price shimmer"></div>

                <div className="skeleton-category shimmer"></div>

            </div>

        </div>

    );

}

export default SkeletonCard;