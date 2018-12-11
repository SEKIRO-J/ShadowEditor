﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ShadowEditor.Model.Material;
using ShadowEditor.Server.Base;
using ShadowEditor.Server.Helpers;

namespace ShadowEditor.Server.Controllers
{
    /// <summary>
    /// 材质控制器
    /// </summary>
    public class MaterialController : ApiBase
    {
        /// <summary>
        /// 获取列表
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public JsonResult List()
        {
            var mongo = new MongoHelper();

            var docs = mongo.FindAll(Constant.MaterialCollectionName);

            var list = new JArray();

            foreach (var i in docs)
            {
                var obj = new JObject
                {
                    ["ID"] = i["ID"].AsObjectId.ToString(),
                    ["Name"] = i["Name"].AsString,
                    ["TotalPinYin"] = i["TotalPinYin"].ToString(),
                    ["FirstPinYin"] = i["FirstPinYin"].ToString(),
                    ["CreateTime"] = i["CreateTime"].ToUniversalTime(),
                    ["UpdateTime"] = i["UpdateTime"].ToUniversalTime(),
                    ["Thumbnail"] = i.Contains("Thumbnail") && !i["Thumbnail"].IsBsonNull ? i["Thumbnail"].ToString() : null
                };

                list.Add(obj);
            }

            return Json(new
            {
                Code = 200,
                Msg = "获取成功！",
                Data = list
            });
        }

        /// <summary>
        /// 编辑
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Edit(MaterialEditModel model)
        {
            var objectId = ObjectId.GenerateNewId();

            if (!string.IsNullOrEmpty(model.ID) && !ObjectId.TryParse(model.ID, out objectId))
            {
                return Json(new
                {
                    Code = 300,
                    Msg = "ID不合法。"
                });
            }

            if (string.IsNullOrEmpty(model.Name))
            {
                return Json(new
                {
                    Code = 300,
                    Msg = "名称不允许为空。"
                });
            }

            var mongo = new MongoHelper();

            var pinyin = PinYinHelper.GetTotalPinYin(model.Name);

            var filter = Builders<BsonDocument>.Filter.Eq("ID", objectId);
            var update1 = Builders<BsonDocument>.Update.Set("Name", model.Name);
            var update2 = Builders<BsonDocument>.Update.Set("TotalPinYin", pinyin.TotalPinYin);
            var update3 = Builders<BsonDocument>.Update.Set("FirstPinYin", pinyin.FirstPinYin);
            var update4 = Builders<BsonDocument>.Update.Set("Thumbnail", model.Thumbnail);

            UpdateDefinition<BsonDocument> update5;

            if (string.IsNullOrEmpty(model.Category))
            {
                update5 = Builders<BsonDocument>.Update.Unset("Category");
            }
            else
            {
                update5 = Builders<BsonDocument>.Update.Set("Category", model.Category);
            }

            var update = Builders<BsonDocument>.Update.Combine(update1, update2, update3, update4, update5);
            mongo.UpdateOne(Constant.MaterialCollectionName, filter, update);

            return Json(new
            {
                Code = 200,
                Msg = "保存成功！"
            });
        }

        /// <summary>
        /// 保存
        /// </summary>
        /// <param name="model">保存场景模型</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Save(MaterialSaveModel model)
        {
            var objectId = ObjectId.GenerateNewId();

            if (!string.IsNullOrEmpty(model.ID) && !ObjectId.TryParse(model.ID, out objectId))
            {
                return Json(new
                {
                    Code = 300,
                    Msg = "ID不合法。"
                });
            }

            if (string.IsNullOrEmpty(model.Name))
            {
                return Json(new
                {
                    Code = 300,
                    Msg = "名称不允许为空。"
                });
            }

            // 查询
            var mongo = new MongoHelper();
            var filter = Builders<BsonDocument>.Filter.Eq("ID", objectId);
            var doc = mongo.FindOne(Constant.MaterialCollectionName, filter);

            var now = DateTime.Now;

            if (doc == null) // 新建
            {
                var pinyin = PinYinHelper.GetTotalPinYin(model.Name);

                doc = new BsonDocument();
                doc["ID"] = objectId;
                doc["Name"] = model.Name;
                doc["CategoryID"] = 0;
                doc["CategoryName"] = "";
                doc["TotalPinYin"] = string.Join("", pinyin.TotalPinYin);
                doc["FirstPinYin"] = string.Join("", pinyin.FirstPinYin);
                doc["Version"] = 0;
                doc["CreateTime"] = BsonDateTime.Create(now);
                doc["UpdateTime"] = BsonDateTime.Create(now);
                doc["Data"] = BsonDocument.Parse(model.Data);
                doc["Thumbnail"] = "";
                mongo.InsertOne(Constant.MaterialCollectionName, doc);
            }
            else // 更新
            {
                var update1 = Builders<BsonDocument>.Update.Set("UpdateTime", BsonDateTime.Create(now));
                var update2 = Builders<BsonDocument>.Update.Set("Data", BsonDocument.Parse(model.Data));
                var update = Builders<BsonDocument>.Update.Combine(update1, update2);
                mongo.UpdateOne(Constant.MaterialCollectionName, filter, update);
            }

            return Json(new
            {
                Code = 200,
                Msg = "保存成功！",
                ID = objectId
            });
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="ID"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Delete(string ID)
        {
            var mongo = new MongoHelper();

            var filter = Builders<BsonDocument>.Filter.Eq("ID", BsonObjectId.Create(ID));
            var doc = mongo.FindOne(Constant.MaterialCollectionName, filter);

            if (doc == null)
            {
                return Json(new
                {
                    Code = 300,
                    Msg = "该材质不存在！"
                });
            }

            mongo.DeleteOne(Constant.MaterialCollectionName, filter);

            return Json(new
            {
                Code = 200,
                Msg = "删除材质成功！"
            });
        }
    }
}