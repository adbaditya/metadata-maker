<?php
/**
 * Template Name: Blog Page Template
 */

get_header(); ?>

<style>
/* Blog Page Header */
.blog-page-hero {
    background: 
        linear-gradient(141deg, rgba(255, 197, 13, 0.9) 0%, rgba(254, 184, 16, 0.9) 93%),
        url('https://simplyassist.ca/wp-content/uploads/2025/03/hero-section-simply-assist.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    padding: 120px 20px 100px;
    color: white;
    text-align: center;
    overflow: hidden;
}

.blog-page-hero-content {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.blog-page-title {
    font-family: "Nunito", Sans-serif;
    font-size: 3.5rem;
    font-weight: 400;
    letter-spacing: -2.6px;
    color: #333333;
    line-height: 1.2;
    margin-bottom: 30px;
}

.blog-page-description {
    font-family: "Nunito Sans", Sans-serif;
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 1.6;
    color: #333333;
    max-width: 800px;
    margin: 0 auto;
}

/* Elementor Mountain Shape Divider */
.elementor-shape {
    overflow: hidden;
    position: absolute;
    left: 0;
    width: 100%;
    line-height: 0;
    direction: ltr;
}

.elementor-shape-bottom {
    bottom: -1px;
    transform: rotate(180deg);
    overflow: hidden;
}

.elementor-shape svg {
    display: block;
    width: 100%;
    height: 100px;
    transform: rotateY(180deg);
    overflow: hidden;
}

.elementor-shape .elementor-shape-fill {
    fill: #ffffff;
}

/* Blog Content Section */
.blog-content-section {
    background: #ffffff;
    padding: 60px 20px;
}

.blog-container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Search Bar */
.blog-search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 50px;
}

.search-form {
    position: relative;
    max-width: 300px;
    width: 100%;
}

.search-input {
    width: 100%;
    padding: 12px 45px 12px 15px;
    border: 2px solid #e1e5e9;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease;
}

.search-input:focus {
    border-color: #FEB810;
}

.search-button {
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    border-radius: 50%;
    display: flex;
    width: 80px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s ease;
}

.search-button:hover {
    background: #FFC50D;
}

.search-button svg {
    width: 30px;
    height: 30px;
    fill: #000;
}

/* Blog Posts Grid - 3 Column Layout */
.blog-posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-bottom: 60px;
}

.blog-post-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.blog-post-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.blog-post-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
}

.blog-post-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.blog-post-card:hover .blog-post-image img {
    transform: scale(1.05);
}

.blog-post-content {
    padding: 25px;
}

.blog-post-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 15px;
    line-height: 1.3;
}

.blog-post-title a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
}

.blog-post-title a:hover {
    color: #FEB810;
}

.blog-post-excerpt {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 0.9rem;
}

.blog-post-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #999;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.post-author {
    text-transform: capitalize;
    font-weight: 500;
}

.post-date {
    font-style: italic;
}

/* Pagination */
.blog-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 40px;
}

.page-numbers {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    text-decoration: none;
    color: #666;
    border: 1px solid #e1e5e9;
    transition: all 0.3s ease;
}

.page-numbers:hover,
.page-numbers.current {
    background: #FEB810;
    color: white;
    border-color: #FEB810;
}

.page-numbers.prev,
.page-numbers.next {
    width: auto;
    padding: 0 15px;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .blog-posts-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
    }
}

@media (max-width: 768px) {
    .blog-page-hero {
        padding: 80px 20px 80px;
    }
    
    .elementor-shape svg {
        height: 60px;
    }
    
    .blog-page-title {
        font-size: 2.5rem;
        letter-spacing: -1.5px;
    }
    
    .blog-page-description {
        font-size: 1.1rem;
    }
    
    .blog-search {
        justify-content: center;
        margin-bottom: 30px;
    }
    
    .blog-posts-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .blog-post-content {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .blog-page-hero {
        padding: 60px 20px 60px;
    }
    
    .elementor-shape svg {
        height: 40px;
    }
    
    .blog-page-title {
        font-size: 2rem;
        letter-spacing: -1px;
    }
    
    .blog-page-description {
        font-size: 1rem;
    }
    
    .search-form {
        max-width: 250px;
    }
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

<main id="content" class="site-main">
    <!-- Blog Page Hero Section -->
    <div class="blog-page-hero">
        <div class="blog-page-hero-content">
            <h1 class="blog-page-title">Simply Assist Blog: Expert Tips & Insights on Virtual Staffing & Business Efficiency</h1>
        </div>
        
        <!-- Elementor Mountain Shape Divider -->
        <div class="elementor-shape elementor-shape-bottom" data-shape="mountains" data-negative="false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path class="elementor-shape-fill" opacity="0.33" d="M473,67.3c-203.9,88.3-263.1-34-320.3,0C66,119.1,0,59.7,0,59.7V0h1000v59.7 c0,0-62.1,26.1-94.9,29.3c-32.8,3.3-62.8-12.3-75.8-22.1C806,49.6,745.3,8.7,694.9,4.7S492.4,59,473,67.3z"></path>
                <path class="elementor-shape-fill" opacity="0.66" d="M734,67.3c-45.5,0-77.2-23.2-129.1-39.1c-28.6-8.7-150.3-10.1-254,39.1 s-91.7-34.4-149.2,0C115.7,118.3,0,39.8,0,39.8V0h1000v36.5c0,0-28.2-18.5-92.1-18.5C810.2,18.1,775.7,67.3,734,67.3z"></path>
                <path class="elementor-shape-fill" d="M766.1,28.9c-200-57.5-266,65.5-395.1,19.5C242,1.8,242,5.4,184.8,20.6C128,35.8,132.3,44.9,89.9,52.5C28.6,63.7,0,0,0,0 h1000c0,0-9.9,40.9-83.6,48.1S829.6,47,766.1,28.9z"></path>
            </svg>
        </div>
    </div>

    <!-- Blog Content Section -->
    <div class="blog-content-section">
        <div class="blog-container">
            <!-- Search Bar -->
            <div class="blog-search">
                <form role="search" method="get" class="search-form" action="<?php echo home_url('/'); ?>">
                    <input type="search" class="search-input" placeholder="Search posts..." value="<?php echo get_search_query(); ?>" name="s" />
                    <button type="submit" class="search-button">
                        <svg viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </button>
                </form>
            </div>

            <!-- Blog Posts Grid -->
            <div class="blog-posts-grid">
                <?php
                // Get current page number for pagination
                $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
                
                // Custom query to fetch blog posts
                $blog_posts = new WP_Query(array(
                    'post_type' => 'post',
                    'post_status' => 'publish',
                    'posts_per_page' => 9, // 9 posts for 3x3 grid
                    'paged' => $paged
                ));
                
                if ($blog_posts->have_posts()) : ?>
                    <?php while ($blog_posts->have_posts()) : $blog_posts->the_post(); ?>
                        <article class="blog-post-card">
                            <div class="blog-post-image">
                                <a href="<?php the_permalink(); ?>">
                                    <?php if (has_post_thumbnail()) : ?>
                                        <?php the_post_thumbnail('medium_large'); ?>
                                    <?php else : ?>
                                        <img src="https://simplyassist.ca/wp-content/uploads/2025/03/hero-section-simply-assist.png" alt="Default post image" />
                                    <?php endif; ?>
                                </a>
                            </div>
                            <div class="blog-post-content">
                                <h2 class="blog-post-title">
                                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                </h2>
                                <div class="blog-post-excerpt">
                                    <?php echo wp_trim_words(get_the_excerpt(), 15, '...'); ?>
                                </div>
                                <div class="blog-post-meta">
                                    <span class="post-author"><?php echo get_the_author(); ?></span>
                                    <span class="post-date"><?php echo get_the_date('F j, Y'); ?></span>
                                </div>
                            </div>
                        </article>
                    <?php endwhile; ?>
                <?php else : ?>
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <h2>No posts found</h2>
                        <p>Sorry, no posts were found. Try searching for something else.</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Pagination -->
            <?php
            $pagination = paginate_links(array(
                'total' => $blog_posts->max_num_pages,
                'current' => $paged,
                'type' => 'array',
                'prev_text' => '← Previous',
                'next_text' => 'Next →',
            ));
            
            if ($pagination) : ?>
                <div class="blog-pagination">
                    <?php foreach ($pagination as $page) : ?>
                        <?php echo $page; ?>
                    <?php endforeach; ?>
                </div>
            <?php endif; 
            
            // Reset post data
            wp_reset_postdata();
            ?>
        </div>
    </div>
    <script>
jQuery(document).ready(function($) {
    let searchTimeout;
    const ajaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
    const searchNonce = '<?php echo wp_create_nonce('search_nonce'); ?>';
    
    // Search input event
    $('.search-input').on('input', function() {
        const searchTerm = $(this).val().trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // If empty, show all posts
        if (searchTerm === '') {
            loadAllPosts();
            return;
        }
        
        // Wait 500ms after user stops typing
        searchTimeout = setTimeout(function() {
            performSearch(searchTerm);
        }, 500);
    });
    
    // Prevent form submission
    $('.search-form').on('submit', function(e) {
        e.preventDefault();
        const searchTerm = $('.search-input').val().trim();
        if (searchTerm !== '') {
            performSearch(searchTerm);
        }
    });
    
    function performSearch(searchTerm) {
        $('.blog-posts-grid').html('<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #FEB810; animation: spin 1s linear infinite;"></div><br><br>Searching...</div>');
        
        $.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'inline_search_posts',
                search_term: searchTerm,
                nonce: searchNonce
            },
            success: function(response) {
                if (response.success) {
                    $('.blog-posts-grid').html(response.data.html);
                    $('.blog-pagination').hide();
                } else {
                    $('.blog-posts-grid').html('<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;"><h2>No posts found</h2><p>No posts match your search for "<strong>' + searchTerm + '</strong>". Try different keywords.</p></div>');
                    $('.blog-pagination').hide();
                }
            },
            error: function() {
                $('.blog-posts-grid').html('<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;"><h2>Search Error</h2><p>Something went wrong. Please try again.</p></div>');
            }
        });
    }
    
    function loadAllPosts() {
        $.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'load_all_posts',
                nonce: searchNonce
            },
            success: function(response) {
                if (response.success) {
                    $('.blog-posts-grid').html(response.data.html);
                    $('.blog-pagination').show();
                }
            }
        });
    }
});
</script>
</main>

<?php get_footer(); ?>