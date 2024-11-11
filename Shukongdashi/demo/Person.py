from __future__ import print_function

import tensorflow as tf
from tensorflow import keras as kr  # 替换tensorflow.contrib.keras
import os
from Shukongdashi.test_my.test_cnnrnn.cnn_model import TCNNConfig, TextCNN
from Shukongdashi.test_my.test_cnnrnn.data.cnews_loader import read_category, read_vocab

# 检查Python 2/3的兼容性
try:
    bool(type(unicode))
except NameError:
    unicode = str

class Person:
    # 构造函数
    def __init__(self, vocab_dir, save_path):
        self.Name = vocab_dir
        self.Sex = save_path
        # 以下部分代码已注释，按需启用
        # self.config = TCNNConfig()
        # self.categories, self.cat_to_id = read_category()
        # self.words, self.word_to_id = read_vocab(vocab_dir)
        # self.config.vocab_size = len(self.words)
        # self.model = TextCNN(self.config)

        # 使用TensorFlow 2.x创建和恢复会话的方式有所改变
        # self.session = tf.compat.v1.Session()
        # self.session.run(tf.compat.v1.global_variables_initializer())
        # saver = tf.compat.v1.train.Saver()
        # saver.restore(sess=self.session, save_path=save_path)  # 读取保存的模型

    def ToString(self):
        return 'Name:' + self.Name + ',Sex:' + self.Sex
