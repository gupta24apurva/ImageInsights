from flask import Flask, request, jsonify
import cv2
from keras.layers import Input, Dense, RepeatVector, LSTM, TimeDistributed, Embedding, Concatenate, Activation
from keras.models import Model
from keras.applications import ResNet50
import numpy as np
from keras.preprocessing.sequence import pad_sequences
from tqdm import tqdm
from flask_cors import CORS

# Load ResNet50 model for image feature extraction
resnet = ResNet50(include_top=False, weights='imagenet', input_shape=(224, 224, 3), pooling='avg')

# Load vocabulary
vocab = np.load('vocab.npy', allow_pickle=True).item()
inv_vocab = {v: k for k, v in vocab.items()}

# Define model parameters
embedding_size = 128
max_len = 40
vocab_size = len(vocab)

# Define input layers
image_input = Input(shape=(2048,))
text_input = Input(shape=(max_len,))

# Define embedding layer
embedding_layer = Embedding(input_dim=vocab_size, output_dim=embedding_size)(text_input)

# Define language model
language_model = LSTM(256, return_sequences=True)(embedding_layer)
language_model = TimeDistributed(Dense(embedding_size))(language_model)

# Define image model
image_model = Dense(embedding_size, activation='relu')(image_input)
image_model = RepeatVector(max_len)(image_model)

# Concatenate image and language models
concatenated = Concatenate(axis=-1)([image_model, language_model])

# Define decoder
decoder = LSTM(128, return_sequences=True)(concatenated)
decoder = LSTM(512, return_sequences=False)(decoder)
output = Dense(vocab_size)(decoder)
output = Activation('softmax')(output)

# Define the model
model = Model(inputs=[image_input, text_input], outputs=output)

# Compile model
model.compile(loss='categorical_crossentropy', optimizer='RMSprop', metrics=['accuracy'])

# Load trained weights
model.load_weights('mine_model_weights.h5')

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/after', methods=['POST'])
def after():
    global model, inv_vocab

    file = request.files['file']
    file.save('static/file.jpg')
    img = cv2.imread('static/file.jpg')
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))

    features = resnet.predict(img.reshape(1, 224, 224, 3)).reshape(1, 2048)

    text_in = ['startofseq']
    final = ''
    count = 0

    while count < 20:
        count += 1
        encoded = [vocab[word] for word in text_in if word in vocab]
        padded = pad_sequences([encoded], maxlen=max_len, padding='post', truncating='post').reshape(1, max_len)
        sampled_index = np.argmax(model.predict([features, padded]))
        sampled_word = inv_vocab[sampled_index]

        if sampled_word != 'endofseq':
            final += ' ' + sampled_word
        text_in.append(sampled_word)

    return jsonify({'caption': final.strip()})

if __name__ == "__main__":
    app.run(debug=True)
