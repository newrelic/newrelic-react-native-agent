import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Browser';

import {
    StyleSheet,
    Image,
    Text,
    View,
    ScrollView,
  } from 'react-native';

  const styles = StyleSheet.create({
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#fff',
    },
    newsItem: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginBottom: 10,
    },
    image: {
      width: '100%',
      height: 200,
      marginBottom: 10,
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 5,
    },
    date: {
      color: '#888',
      marginBottom: 5,
    },
    blurb: {
      fontSize: 14,
    },
  });
  
  interface NewsItem {
    url: string;
    urlToImage: string;
    title: string;
    publishedAt: string;
    description: string;
  }

const NewsFeedScreen = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = require('./newsdata.json');
        setNewsData(data.articles);
      } catch (error) {
        console.error('Error fetching news data:', error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: moment.MomentInput) => {
    const formattedDate = moment(dateString).format('dddd, MMMM D, YYYY h:mma');
    return formattedDate;
  };
    async function navigateToArticle(title: string, url: string) {
      navigation.navigate('Browser', {title, url});
    }
    return (
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {newsData.map((news, index) => {
            return (
              <TouchableOpacity onPress={() => navigateToArticle(news.title, news.url)} key={index}>
                <View style={styles.newsItem}>
                  <Image source={{ uri: news.urlToImage }} style={styles.image} />
                  <Text style={styles.title}>{news.title}</Text>
                  <Text style={styles.date}>{formatDate(news.publishedAt)}</Text>
                  <Text style={styles.blurb}>{news.description}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    )
}

export default NewsFeedScreen;