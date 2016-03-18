# Humane Discovery
Humane Discovery product stack aims to solve entire discovery problem space for content (such as exams, jobs), news & media, ecommerce, digital goods products etc. More specifically product approaches the discovery problem in 3 broad parts --

- Search based discovery, such as autocomplete, suggested queries, search results, instance searches.
- Personalised discovery such as recommended products (or posts). 
- Curated discovery such as curated collections or products.
- Domain specific discovery algorithms such as news one may have missed since last visit.

We call the lowest unit that can be searched, personalised or curated a **'Product'**. These can be any of the following --
- Banners
- Tabs
- Categories
- E-commerce Products
- Digital Products such as e-books, PDFs
- Posts such as News, Articles
- Blogs or Articles
- Discounts
- Offers
- Delivery Slots
- Collections
 
## Search based discovery
- APIs for 
  - Autocomplete, 
  - Suggested Queries, 
  - Search Results, 
  - Instance Search (Search As You Type).
- Excellent support for fuzzy queries, and vernacular queries.
- Easy synonyms management (add, update, & remove) without worrying about re-indexing as product takes care of re-indexing or query-expansion itself.
- Match relevancy algorithm that considers
  - Some fields are more important than others.
  - Matches in single field are better than matches in two separate fields.
  - Phrase matches are better than single field matches.
  - Single field matches in lower weight field are better than matches in two different higher weight field. 
- Product's weight autocomputation from disparate type of signals - views, downloads, add to cart, cart abandonment, purchases, time spent, or any custom events.
- Multiple ways to compute weight --
  - Weighted signals based weight.
  - Holt Winter's based trend forecast weight.

## Personalised discovery [_ROADMAP_]
- Personalises entire experience based on user profile, past behavior, and geo-location, such as --
  - Banners
  - Tabs
  - Categories
  - E-commerce Products
  - Digital Products such as e-books, PDFs
  - Posts such as News, Articles
  - Blogs or Articles
  - Discounts
  - Offers
  - Delivery Slots
  - Collections
- Auto learns user preferences based on implicit behaviors.
- Auto A/B tests new products to learn user preferences.
- Careful mix of recommendations, curated, A/B test products.
- Collaborative filtering based discovery algorithms, such as people who bought (or any other signal) X also bought (or any other signal)

## Curated discovery [_ROADMAP_]
- Hand or community curated products or their collections.

## Domain specific discovery algorithms [_ROADMAP_]
- Many domain specific discovery algorithms, such as --
  - News one may have missed since last visit.
  - Popular Products
  - Trending Products
- Custom algorithms can be composed in functional style.

---
## Data Pipeline
- A very powerful data pipeline that can import data from variety of sources --
  - CSV Files
  - TSV Files
  - JSON Files
  - Array of JSON
- Transform or multiplex data through JS functions.
- Extend data with lookups & mapper
- Output data to Indexer, as of now (more to come).
