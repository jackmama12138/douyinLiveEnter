const axios = require('axios');
const cors = require('cors');
const path = require('path');
const express = require('express');
const {generate_a_bogus} = require('./a_bogus');

// 创建Express应用实例
const app = express();

// 配置项
const CONFIG = {
  PORT: process.env.PORT || 3001,
  DEFAULT_ANCHOR_ID: '73016627965',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  MOBILE_USER_AGENT: 'Mozilla/5.0 (Linux; Android 9; GM1900 Build/PKQ1.190110.001; wv) AppleWebKit/537.36636 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.62 XWEB/2691 MMWEBSDK/20.6.0 Mobile Safari/537.36 MMWEBID/3590 MicroMessenger/7.0.18.1720(0x2700123D) Process/toolsmp WeChat/arm32 Weixin NetType/WIFI Language/zh_CN ABI/arm32'
};

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/**
 * 通用错误处理函数
 * @param {Object} res - Express响应对象
 * @param {Error} error - 错误对象
 * @param {String} message - 错误消息
 */
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({
    error: message,
    details: error.message
  });
};

/**
 * 获取热门榜数据
 * @param {String} anchorId - 主播ID
 * @returns {Promise<Object>} 返回热门榜数据
 */
async function fetchHotList(anchorId) {
  const baseURL = 'https://live.douyin.com/webcast/ranklist/popularity/';
  const params = {
    aid: '6383',
    app_name: 'douyin_web',
    live_id: '1',
    device_platform: 'web',
    language: 'zh-CN',
    enter_from: 'web_live',
    cookie_enabled: 'true',
    screen_width: '1680',
    screen_height: '1050',
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Chrome',
    browser_version: '124.0.0.0',
    browser_online: 'true',
    engine_name: 'Blink',
    engine_version: '124.0.0.0',
    os_name: 'Mac OS',
    os_version: '10.15.7',
    cpu_core_num: '8',
    device_memory: '8',
    platform: 'PC',
    downlink: '10',
    effective_type: '4g',
    round_trip_time: '50',
    channel: 'channel_pc_web',
    user_agent: CONFIG.USER_AGENT,
    anchor_id: anchorId,
    msToken: '-Rb2Lv1R9oB47Qch_KSEVx-zt0fuMVDEf2oMwRKMM03ia9bIhJq1Nw0IGYDhC8Ftnqp7fcgKxBJZegu6omHLfWSk6xLUAP3Xn3lbcPmVQZMw8TVo3srG'
  };
  
  const URLParams = new URLSearchParams(params).toString();
  const a_bogus = generate_a_bogus(URLParams, params.user_agent);
  const URL = `${baseURL}?${URLParams}&a_bogus=${a_bogus}`;
  const headers = { 'User-Agent': params.user_agent };
  
  const { data } = await axios.get(URL, { headers });
  return data;
}

/**
 * 获取人气榜数据
 * @returns {Promise<Object>} 返回人气榜数据
 */
async function fetchRankList() {
  const config = {
    method: 'get',
    url: 'https://webcast.amemv.com/webcast/ranklist/hot/?is_vcd=1&request_tag_from=h5&iid=4176368935690585&device_id=4040036107697033&ac=wifi&channel=tengxun_1128_1025&aid=1128&app_name=aweme&version_code=200600&version_name=20.6.0&device_platform=android&os=android&ssmix=a&device_type=GM1900&device_brand=OnePlus&language=zh&os_api=28&os_version=9&openudid=ba63e8241d176a04&manifest_version_code=200601&resolution=1080*1920&dpi=480&update_version_code=20609900&_rticket=1715898854319&package=com.ss.android.ugc.aweme&mcc_mnc=46000&cpu_support64=true&host_abi=armeabi-v7a&is_guest_mode=0&app_type=normal&minor_status=0&appTheme=light&need_personal_recommend=1&is_android_pad=0&ts=1715898853&cdid=aa0836de-a62b-4fce-bd19-d3d365bb936a&uuid=010306025944827',
    headers: {
      'X-Ladon': '6I0FFvx8+Hc6jJe8WyZ867qzMyLWkLFr6aq+0ei2RbFbpfND',
      'X-Argus': 'xwN6fLps5ukyOe4SXaKeF6u4kOVGTBBF2Q14CnLyhGEpi4sw0P2fIDqA+6RHxyghXdM9Hr4MjOqZZp/v582/ERqFHvbUaerpMZwSaOlecUJkkPKRN6bvnKk7Z/5ehq0bQPAqpxvpvlhEHw4TlEEfvfkgm9AsDRbVFXkNN/m4sxvzSKYfD36jty6QXxZOPD5EDdwZlcy20pPgdnWQuEy68yxNP2zDHMeEcoaGgx5gUF87P+hD4wwJLJb/P2KqPCbvvx+K2VqDYrAIZs5UcXctkyDU',
      'User-Agent': CONFIG.MOBILE_USER_AGENT
    },
    withCredentials: true
  };
  
  const response = await axios(config);
  return response.data;
}

/**
 * 合并热门榜和人气榜数据
 * @param {Object} hotListData - 热门榜数据
 * @param {Object} rankListData - 人气榜数据
 * @returns {Object} 合并后的数据
 */
function mergeHotAndRankData(hotListData, rankListData) {
  const processedRankData = {
    ranks: [],
    hotList: []
  };
  
  // 处理人气榜数据
  if (rankListData?.data?.ranks && Array.isArray(rankListData.data.ranks)) {
    processedRankData.ranks = rankListData.data.ranks.map(item => {
      const displayId = item.user?.display_id || '';
      
      return {
        score: item.score, // 人气值
        user: {
          display_id: displayId, // 主播id
          nickname: item.user?.nickname || '未知', // 主播名
          avatar_thumb: {
            url_list: [item.user?.avatar_thumb?.url_list[0] || ''] // 主播头像，保持与前端一致的数组结构
          }
        },
        room: {
          user_count: item.room?.user_count || 0, // 在线人数
          id: item.room?.id || 0 // 直播状态，0表示未直播
        },
        rank: item.rank, // 人气榜排名
        live_url: `https://live.douyin.com/${displayId}` // 直播间地址
      };
    });
  }
  
  // 处理热门榜数据
  if (hotListData?.data?.ranks && Array.isArray(hotListData.data.ranks)) {
    processedRankData.hotList = hotListData.data.ranks.map(rank => ({
      contributor_text: rank.contributor_text || '', // 助力人数
      fansclub_name: rank.fansclub_name || '' // 粉丝团名称
    }));
    
    // 合并数据到ranks数组中
    processedRankData.ranks = processedRankData.ranks.map((item, index) => ({
      ...item,
      contributor_text: hotListData.data.ranks[index]?.contributor_text || '',
      fansclub_name: hotListData.data.ranks[index]?.fansclub_name || ''
    }));
  }
  
  return {
    data: processedRankData
  };
}

/**
 * 热门榜数据API路由 - 固定使用主播ID，只返回助力人数和粉丝团名称
 */
app.get('/api/douyin/hotlist', async (req, res) => {
  try {
    const anchorId = CONFIG.DEFAULT_ANCHOR_ID;
    console.log(`接收到热门榜请求，使用固定主播ID: ${anchorId}`);
    
    const data = await fetchHotList(anchorId);
    console.log('抖音热门榜API请求成功');
    
    // 处理数据，只保留需要的字段
    const processedData = {
      ranks: data.data?.ranks?.map(rank => ({
        contributor_text: rank.contributor_text || '', // 助力人数
        fansclub_name: rank.fansclub_name || '' // 粉丝团名称
      })) || []
    };
    
    res.json(processedData);
  } catch (e) {
    handleError(res, e, '抖音热门榜API请求失败:');
  }
});

/**
 * 主播人气榜API路由 - 只返回指定的字段数据
 */
app.get('/api/douyin/ranklist', async (req, res) => {
  try {
    console.log('接收到人气榜请求，转发到抖音API...');
    
    const data = await fetchRankList();
    console.log('API请求成功');
    
    // 只保留需要的字段，并添加直播间地址
    if (data?.data?.ranks && Array.isArray(data.data.ranks)) {
      data.data.ranks = data.data.ranks.map(item => {
        const displayId = item.user?.display_id || '';
        
        return {
        score: item.score, // 人气值
        user: {
          display_id: displayId, // 主播id
          nickname: item.user?.nickname || '未知', // 主播名
          avatar_thumb: {
            url_list: [item.user?.avatar_thumb?.url_list[0] || ''] // 主播头像，保持与前端一致的数组结构
          }
        },
          room: {
            user_count: item.room?.user_count || 0, // 在线人数
            id: item.room?.id || 0 // 直播状态，0表示未直播
          },
          rank: item.rank, // 人气榜排名
          live_url: `https://live.douyin.com/${displayId}` // 直播间地址
        };
      });
    }
    
    res.json(data);
  } catch (e) {
    handleError(res, e, '代理请求失败:');
  }
});

/**
 * 合并数据API路由 - 结合热门榜和人气榜数据
 */
app.get('/api/douyin', async (req, res) => {
  try {
    console.log('接收到合并数据请求，开始获取热门榜和人气榜数据...');
    
    // 并行请求两个接口数据
    const [hotListData, rankListData] = await Promise.all([
      fetchHotList(CONFIG.DEFAULT_ANCHOR_ID),
      fetchRankList()
    ]);
    
    console.log('热门榜和人气榜数据获取成功，开始合并...');
    
    // 合并数据
    const mergedData = mergeHotAndRankData(hotListData, rankListData);
    
    console.log('数据合并完成，返回结果...');
    res.json(mergedData);
  } catch (e) {
    handleError(res, e, '合并数据请求失败:');
  }
});

/**
 * 根路由，返回live_rank.html
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'live_rank.html'));
});

// 启动服务器
app.listen(CONFIG.PORT, () => {
  console.log(`✨ 代理服务器已启动: http://localhost:${CONFIG.PORT}`);
  console.log(`💡 访问 http://localhost:${CONFIG.PORT} 开始使用`);
  console.log(`🎯 可用接口:`);
  console.log(`   - 人气榜: http://localhost:${CONFIG.PORT}/api/douyin/ranklist`);
  console.log(`   - 热门榜: http://localhost:${CONFIG.PORT}/api/douyin/hotlist`);
  console.log(`   - 合并数据: http://localhost:${CONFIG.PORT}/api/douyin`);
});