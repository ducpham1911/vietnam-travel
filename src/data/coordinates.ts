export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  hanoi: { lat: 21.0285, lng: 105.8542 },
  danang: { lat: 16.0471, lng: 108.2068 },
  hcmc: { lat: 10.7769, lng: 106.7009 },
  hoian: { lat: 15.8801, lng: 108.338 },
  hue: { lat: 16.4637, lng: 107.5909 },
  nhatrang: { lat: 12.2388, lng: 109.1967 },
  phuquoc: { lat: 10.2899, lng: 103.984 },
  dalat: { lat: 11.9404, lng: 108.4583 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  halong: { lat: 20.9101, lng: 107.1839 },
};

export const placeCoordinates: Record<string, { lat: number; lng: number }> = {
  // Hà Nội
  hn01: { lat: 21.0288, lng: 105.8525 }, // Hoàn Kiếm Lake
  hn02: { lat: 21.0275, lng: 105.8355 }, // Temple of Literature
  hn03: { lat: 21.0369, lng: 105.8353 }, // Hồ Chí Minh Mausoleum
  hn04: { lat: 21.0338, lng: 105.8522 }, // Old Quarter
  hn05: { lat: 21.0359, lng: 105.8338 }, // One Pillar Pagoda
  hn06: { lat: 21.0132, lng: 105.8567 }, // Bún Chả Hương Liên
  hn07: { lat: 21.0152, lng: 105.8601 }, // Phở Thìn Lò Đúc
  hn08: { lat: 21.0387, lng: 105.8499 }, // Đông Xuân Market
  hn09: { lat: 21.0245, lng: 105.8577 }, // Hanoi Opera House
  hn10: { lat: 21.0536, lng: 105.8236 }, // West Lake
  hn11: { lat: 21.0341, lng: 105.8518 }, // Café Giảng
  hn12: { lat: 21.0404, lng: 105.7982 }, // Vietnam Museum of Ethnology

  // Đà Nẵng
  dn01: { lat: 15.9977, lng: 107.9882 }, // Bà Nà Hills & Golden Bridge
  dn02: { lat: 16.0611, lng: 108.2277 }, // Dragon Bridge
  dn03: { lat: 16.0034, lng: 108.2631 }, // Marble Mountains
  dn04: { lat: 16.0574, lng: 108.2467 }, // Mỹ Khê Beach
  dn05: { lat: 16.068, lng: 108.2241 }, // Hàn Market
  dn06: { lat: 16.1003, lng: 108.2777 }, // Linh Ứng Pagoda
  dn07: { lat: 16.1162, lng: 108.2775 }, // Sơn Trà Peninsula
  dn08: { lat: 16.0679, lng: 108.2114 }, // Bê Thui Quán Trần
  dn09: { lat: 16.0664, lng: 108.2153 }, // Mì Quảng Bà Mua
  dn10: { lat: 16.0393, lng: 108.2277 }, // Asia Park

  // Hồ Chí Minh City
  sg01: { lat: 10.7725, lng: 106.698 }, // Bến Thành Market
  sg02: { lat: 10.7798, lng: 106.699 }, // Notre-Dame Cathedral
  sg03: { lat: 10.7795, lng: 106.6922 }, // War Remnants Museum
  sg04: { lat: 10.7769, lng: 106.6955 }, // Independence Palace
  sg05: { lat: 10.7678, lng: 106.6935 }, // Bùi Viện Walking Street
  sg06: { lat: 10.7891, lng: 106.6961 }, // Jade Emperor Pagoda
  sg07: { lat: 10.7884, lng: 106.686 }, // Phở Hòa Pasteur
  sg08: { lat: 10.8006, lng: 106.6772 }, // Cơm Tấm Ba Ghiền
  sg09: { lat: 10.7716, lng: 106.7046 }, // Bitexco Financial Tower
  sg10: { lat: 11.1413, lng: 106.4634 }, // Củ Chi Tunnels

  // Hội An
  ha01: { lat: 15.8772, lng: 108.3269 }, // Japanese Covered Bridge
  ha02: { lat: 15.8776, lng: 108.328 }, // Ancient Town
  ha03: { lat: 15.8991, lng: 108.3613 }, // An Bàng Beach
  ha04: { lat: 15.8783, lng: 108.3276 }, // Morning Glory Restaurant
  ha05: { lat: 15.8755, lng: 108.3308 }, // Hội An Night Market
  ha06: { lat: 15.8926, lng: 108.3424 }, // Trà Quế Vegetable Village
  ha07: { lat: 15.8786, lng: 108.3266 }, // Cao Lầu Thanh
  ha08: { lat: 15.8774, lng: 108.3285 }, // Phước Kiến Assembly Hall
  ha09: { lat: 15.8779, lng: 108.327 }, // Reaching Out Tea House
  ha10: { lat: 15.8855, lng: 108.3666 }, // Cua Đại Beach

  // Huế
  hu01: { lat: 16.4698, lng: 107.5786 }, // Imperial Citadel
  hu02: { lat: 16.4537, lng: 107.5508 }, // Thiên Mụ Pagoda
  hu03: { lat: 16.3939, lng: 107.5869 }, // Tomb of Khải Định
  hu04: { lat: 16.4175, lng: 107.5589 }, // Tomb of Tự Đức
  hu05: { lat: 16.4731, lng: 107.5876 }, // Đông Ba Market
  hu06: { lat: 16.4607, lng: 107.5852 }, // Bún Bò Huế Bà Tuyết
  hu07: { lat: 16.4589, lng: 107.5729 }, // Perfume River
  hu08: { lat: 16.4622, lng: 107.5968 }, // Cơm Hến
  hu09: { lat: 16.4611, lng: 107.5824 }, // An Định Palace
  hu10: { lat: 16.4713, lng: 107.5756 }, // Huế Royal Antiquities Museum

  // Nha Trang
  nt01: { lat: 12.2231, lng: 109.2289 }, // VinWonders
  nt02: { lat: 12.2653, lng: 109.1962 }, // Po Nagar Cham Towers
  nt03: { lat: 12.2464, lng: 109.1963 }, // Nha Trang Beach
  nt04: { lat: 12.2435, lng: 109.1915 }, // Dam Market
  nt05: { lat: 12.2483, lng: 109.1916 }, // Long Thanh Gallery
  nt06: { lat: 12.2737, lng: 109.2002 }, // Hòn Chồng Rocks
  nt07: { lat: 12.2442, lng: 109.1975 }, // Sailing Club
  nt08: { lat: 12.2401, lng: 109.1935 }, // Lanterns Restaurant
  nt09: { lat: 12.1748, lng: 109.268 }, // Hòn Mun Island
  nt10: { lat: 12.2184, lng: 109.2143 }, // Institute of Oceanography

  // Phú Quốc
  pq01: { lat: 10.3692, lng: 103.8755 }, // Vinpearl Safari
  pq02: { lat: 10.1633, lng: 104.0417 }, // Sao Beach
  pq03: { lat: 10.2151, lng: 103.9639 }, // Night Market
  pq04: { lat: 10.2161, lng: 103.96 }, // Dinh Cau Rock Temple
  pq05: { lat: 10.3319, lng: 103.8529 }, // Bãi Dài Beach
  pq06: { lat: 10.2204, lng: 103.968 }, // Fish Sauce Factory
  pq07: { lat: 10.0478, lng: 104.0145 }, // Hòn Thơm Cable Car
  pq08: { lat: 10.174, lng: 103.987 }, // Crab House Restaurant
  pq09: { lat: 10.3502, lng: 103.9258 }, // National Park
  pq10: { lat: 10.1808, lng: 103.965 }, // Sunset Sanato Beach Club

  // Đà Lạt
  dl01: { lat: 11.9434, lng: 108.4423 }, // Xuân Hương Lake
  dl02: { lat: 11.9364, lng: 108.4316 }, // Crazy House
  dl03: { lat: 11.9589, lng: 108.4498 }, // Valley of Love
  dl04: { lat: 11.9416, lng: 108.4548 }, // Dalat Railway Station
  dl05: { lat: 11.9146, lng: 108.4764 }, // Linh Phước Pagoda
  dl06: { lat: 11.946, lng: 108.4406 }, // Night Market
  dl07: { lat: 11.9266, lng: 108.4592 }, // Datanla Waterfall
  dl08: { lat: 11.947, lng: 108.4326 }, // Lẩu Gà Lá É
  dl09: { lat: 11.9554, lng: 108.4211 }, // Mê Linh Coffee Garden
  dl10: { lat: 11.9372, lng: 108.4382 }, // Domaine de Marie Church

  // Sa Pa
  sp01: { lat: 22.3033, lng: 103.7751 }, // Fansipan Peak
  sp02: { lat: 22.325, lng: 103.8339 }, // Cát Cát Village
  sp03: { lat: 22.298, lng: 103.866 }, // Mường Hoa Valley
  sp04: { lat: 22.3591, lng: 103.8591 }, // Tả Phìn Village
  sp05: { lat: 22.3394, lng: 103.8432 }, // Hàm Rồng Mountain
  sp06: { lat: 22.3201, lng: 103.7987 }, // Love Waterfall
  sp07: { lat: 22.3364, lng: 103.8438 }, // Sa Pa Market
  sp08: { lat: 22.3341, lng: 103.8397 }, // Hill Station Signature
  sp09: { lat: 22.3403, lng: 103.7939 }, // Silver Waterfall
  sp10: { lat: 22.298, lng: 103.8526 }, // Sapa Jade Hill Resort

  // Hạ Long
  hl01: { lat: 20.9, lng: 107.08 }, // Hạ Long Bay Cruise
  hl02: { lat: 20.8967, lng: 107.1132 }, // Sửng Sốt Cave
  hl03: { lat: 20.9091, lng: 107.0986 }, // Ti Tốp Island
  hl04: { lat: 20.95, lng: 107.26 }, // Bái Tử Long Bay
  hl05: { lat: 20.8926, lng: 107.0696 }, // Đầu Gỗ Cave
  hl06: { lat: 20.8115, lng: 107.0458 }, // Floating Fishing Villages
  hl07: { lat: 20.955, lng: 107.07 }, // Night Market
  hl08: { lat: 20.949, lng: 107.072 }, // Cái Dăm Seafood Street
  hl09: { lat: 20.9577, lng: 107.0505 }, // Sun World Hạ Long Park
  hl10: { lat: 20.9559, lng: 107.061 }, // Bãi Cháy Beach
};
