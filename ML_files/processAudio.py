import sys
import io
import os
import numpy as np
import librosa
import librosa.display
from sklearn.preprocessing import LabelEncoder
labelencoder=LabelEncoder()
incomingFileName = sys.argv[1]
filename = os.path.join( os.path.dirname( __file__ ), '..' ) + "/audioFiles/" + incomingFileName

from keras.models import load_model
from keras import backend as K

def recall_m(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    recall = true_positives / (possible_positives + K.epsilon())
    return recall

def precision_m(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    precision = true_positives / (predicted_positives + K.epsilon())
    return precision

def f1_m(y_true, y_pred):
    precision = precision_m(y_true, y_pred)
    recall = recall_m(y_true, y_pred)
    return 2*((precision*recall)/(precision+recall+K.epsilon()))

loaded_model = load_model(os.path.join("./ML_files/","model875.h5"),custom_objects={
    "f1_m" : f1_m,
    "precision_m":precision_m,
    "recall_m":recall_m
    })
loaded_model.compile(loss='categorical_crossentropy',metrics=['acc',f1_m,precision_m, recall_m] ,optimizer='adam')

audio, sample_rate = librosa.load(filename, res_type='kaiser_best')
mfccs_features = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
mfccs_scaled_features = np.mean(mfccs_features.T,axis=0)

#print(mfccs_scaled_features)
mfccs_scaled_features=mfccs_scaled_features.reshape(1,-1)
#print(mfccs_scaled_features)
#print(mfccs_scaled_features.shape)
predicted_label=loaded_model.predict_classes(mfccs_scaled_features)
#print(predicted_label)
status = "Negative" if predicted_label[0]==0 else "Positive"
print(status)
#prediction_class = labelencoder.inverse_transform(predicted_label)
#print(prediction_class)
