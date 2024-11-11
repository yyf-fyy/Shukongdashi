import tensorflow as tf
from Shukongdashi.test_my.test_cnnrnn.cnn_model import TCNNConfig, TextCNN
from Shukongdashi.test_my.test_cnnrnn.data.cnews_loader import read_category, read_vocab
import os
import tensorflow.keras as kr

# 数据和模型路径
base_dir = os.path.join(os.getcwd(), 'Shukongdashi', 'demo', 'data', 'cnews')
vocab_dir = os.path.join(base_dir, 'guzhang.vocab.txt')

save_dir = os.path.join(os.getcwd(), 'Shukongdashi', 'demo', 'checkpoints', 'textcnn')
save_path = os.path.join(save_dir, 'best_validation')  # 最佳验证结果保存路径

# 禁用 Eager Execution（兼容 TensorFlow 1.x 的代码）
tf.compat.v1.disable_eager_execution()

class CnnModel:
    def __init__(self):
        # 初始化模型和配置
        self.config = TCNNConfig()
        self.categories, self.cat_to_id = read_category()
        self.words, self.word_to_id = read_vocab(vocab_dir)
        self.config.vocab_size = len(self.words)
        self.model = TextCNN(self.config)

        # 创建会话并初始化变量
        self.session = tf.compat.v1.Session()
        self.session.run(tf.compat.v1.global_variables_initializer())

        # 使用 tf.compat.v1.train.Saver 恢复模型，并捕获异常
        saver = tf.compat.v1.train.Saver()
        try:
            saver.restore(self.session, save_path)
            print("模型成功恢复！")
        except tf.errors.NotFoundError as e:
            print("某些变量未在检查点中找到，加载时被忽略：", e)

    def predict(self, message):
        # 支持 Python 2 和 3 的模型运行
        content = str(message)  # 使用 str 以支持 Python 3
        data = [self.word_to_id[x] for x in content if x in self.word_to_id]

        # 使用 pad_sequences 处理输入数据
        feed_dict = {
            self.model.input_x: kr.preprocessing.sequence.pad_sequences([data], self.config.seq_length),
            self.model.keep_prob: 1.0  # 关闭 Dropout
        }

        # 运行模型进行预测
        y_pred_cls = self.session.run(self.model.y_pred_cls, feed_dict=feed_dict)
        return self.categories[y_pred_cls[0]]

# 主程序入口
if __name__ == '__main__':
    cnn_model = CnnModel()
    test_demo = [
        'FANUC机床类型机床类型M的卧式加工中心',
        '伺服驱动主电源无法正常接通',
        '一台配套FANUC 0M的二手数控铣床，采用FANUC S系列主轴驱动器',
        '开机后，不论输入S*! M03或S*! M04指令',
        '主轴仅仅出现低速旋转，实际转速无法达到指令值。'
    ]

    for i in test_demo:
        print(cnn_model.predict(i))
