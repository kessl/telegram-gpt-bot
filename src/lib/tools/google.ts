import { DynamicTool } from 'langchain/tools'
import google from 'googlethis'
import log from '../../utils/log'

export const googleTool = new DynamicTool({
  name: 'Google',
  description: 'Use Google to search the internet. Input should be a string',
  func: async (searchPhrase: string) => {
    try {
      const response = await google.search(searchPhrase, {
        page: 0,
        safe: false,
        parse_ads: false,
        additional_params: {
          // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
        },
      })
      log('debug', { googleResponse: response })

      return JSON.stringify({
        results: response.results,
        featured: response.featured_snippet,
      })
    } catch (error) {
      log('error', error)
      return 'Failed to get results from Google. Do not try using Google again.'
    }
  },
})
