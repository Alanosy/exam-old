<template>
  <div class="app-container exam-form-page">
    <h3 class="form-page-title">组卷信息</h3>
    <p class="form-section-desc page-desc">选择题库抽题或手动选题组成试卷</p>
    <el-tabs type="border-card" @tab-click="handleClick" v-model="activeName">
      <el-tab-pane label="自己选题" name="first">
        <ChooseQuestion
          @selected-change="handleSelectedChange"
          ref="questionSelector"
        ></ChooseQuestion>
      </el-tab-pane>
      <el-tab-pane label="随机抽题" name="second">
        <div>
          <!-- <el-button class="filter-item" size="small" type="primary" icon="el-icon-plus" @click="handleAdd">
          添加题库
        </el-button> -->

          <el-table
            :data="repoList"
            :border="false"
            empty-text="请点击上面的`添加题库`进行设置"
            class="random-repo-table"
            style="width: 100%; margin-top: 15px"
          >
            <el-table-column label="题库" min-width="180">
              <template v-slot="scope">
                <repo-select
                  v-model="scope.row.repoId"
                  :multi="false"
                  :excludes="excludes"
                  @change="repoChange($event, scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="单选数量" align="center" min-width="130">
              <template v-slot="scope">
                <div class="count-cell">
                  <el-input-number
                    v-model="scope.row.radioCount"
                    :min="0"
                    :max="scope.row.totalRadio"
                    :controls="false"
                    class="count-input"
                  />
                  <span v-if="scope.row.totalRadio != undefined" class="count-total">
                    / {{ scope.row.totalRadio }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="单选分数" align="center" min-width="100">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.radioScore"
                  :min="0"
                  :controls="false"
                  class="score-input"
                />
              </template>
            </el-table-column>

            <el-table-column label="多选数量" align="center" min-width="130">
              <template v-slot="scope">
                <div class="count-cell">
                  <el-input-number
                    v-model="scope.row.multiCount"
                    :min="0"
                    :max="scope.row.totalMulti"
                    :controls="false"
                    class="count-input"
                  />
                  <span v-if="scope.row.totalMulti != undefined" class="count-total">
                    / {{ scope.row.totalMulti }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="多选分数" align="center" min-width="100">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.multiScore"
                  :min="0"
                  :controls="false"
                  class="score-input"
                />
              </template>
            </el-table-column>

            <el-table-column label="判断题数量" align="center" min-width="130">
              <template v-slot="scope">
                <div class="count-cell">
                  <el-input-number
                    v-model="scope.row.judgeCount"
                    :min="0"
                    :max="scope.row.totalJudge"
                    :controls="false"
                    class="count-input"
                  />
                  <span v-if="scope.row.totalJudge != undefined" class="count-total">
                    / {{ scope.row.totalJudge }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="判断题分数" align="center" min-width="100">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.judgeScore"
                  :min="0"
                  :controls="false"
                  class="score-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="简答题数量" align="center" min-width="130">
              <template v-slot="scope">
                <div class="count-cell">
                  <el-input-number
                    v-model="scope.row.saqCount"
                    :min="0"
                    :max="scope.row.totalSaq"
                    :controls="false"
                    class="count-input"
                  />
                  <span v-if="scope.row.totalSaq != undefined" class="count-total">
                    / {{ scope.row.totalSaq }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="简答题分数" align="center" min-width="100">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.saqScore"
                  :min="0"
                  :controls="false"
                  class="score-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="填空题数量" align="center" min-width="130">
              <template v-slot="scope">
                <div class="count-cell">
                  <el-input-number
                    v-model="scope.row.fillCount"
                    :min="0"
                    :max="scope.row.totalFill"
                    :controls="false"
                    class="count-input"
                  />
                  <span v-if="scope.row.totalFill != undefined" class="count-total">
                    / {{ scope.row.totalFill }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="填空题分数" align="center" min-width="100">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.fillScore"
                  :min="0"
                  :controls="false"
                  class="score-input"
                />
              </template>
            </el-table-column>
            <!-- <el-table-column label="删除" align="center" width="80px">
            <template v-slot="scope">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeItem(scope.$index)"
              />
            </template>
          </el-table-column> -->
          </el-table>
        </div>
        <!-- </el-card> -->
      </el-tab-pane>
    </el-tabs>

    <h3 class="form-page-title section-gap">考试配置</h3>
    <p class="form-section-desc page-desc">设置考试名称、分数、时长与时间范围</p>
    <el-card class="form-card">
      <el-form
        ref="postForm"
        :model="postForm"
        :rules="rules"
        label-position="left"
        label-width="120px"
      >
        <div class="form-section">
          <h4 class="form-section-title">基础设置</h4>
          <el-form-item label="考试名称" prop="title">
            <el-input v-model="postForm.title" />
          </el-form-item>

          <el-form-item label="总分" prop="totalScore">
            <el-input-number v-model="postForm.totalScore" :min="1" :controls="false" />
            <span class="inline-hint">必填，须等于题目合计 {{ liveTotalScore }} 分</span>
          </el-form-item>

          <el-form-item label="及格分" prop="passedScore">
            <el-input-number
              v-model="postForm.passedScore"
              :min="0"
              :max="postForm.totalScore || 9999"
            />
          </el-form-item>
        </div>

        <div class="form-section">
          <h4 class="form-section-title">规则与证书</h4>
          <el-form-item label="最多切屏次数" prop="maxCount">
            <el-input-number v-model="postForm.maxCount" />
          </el-form-item>
          <el-form-item label="证书" prop="maxCount">
            <CertificateSelect
              ref="certificateSelect"
              v-model="postForm.certificateId"
              is-multiple
              @change="onCertificateChange"
            />
          </el-form-item>
          <el-form-item label="考试时长(分钟)" prop="examDuration">
            <el-input-number v-model="postForm.examDuration" />
          </el-form-item>
          <el-form-item label="填空需批改">
            <el-switch
              v-model="postForm.fillNeedMark"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
          <el-form-item label="考试时间范围" prop="start">
            <el-date-picker
              v-model="postForm.start"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <h3 class="form-page-title section-gap">权限配置</h3>
    <p class="form-section-desc page-desc">指定可参加本次考试的班级</p>
    <el-card class="form-card">
      <div style="display: flex">
        <div style="margin-left: 10px">
          <el-form
            ref="postForm"
            :model="postForm"
            :rules="rules"
            label-position="left"
            label-width="120px"
          >
            <el-form-item label="考试班级" prop="classIds">
              <ClassSelect
                ref="classSelect"
                v-model="postForm.classIds"
                is-multiple
                @change="onClassChange"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <div style="margin-top: 20px">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>

    <!-- 实时分数悬浮面板 -->
    <div class="score-float" :class="{ collapsed: floatCollapsed }">
      <div class="score-float-head">
        <span>实时统计</span>
        <el-button
          type="text"
          class="score-float-toggle"
          :icon="floatCollapsed ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="floatCollapsed = !floatCollapsed"
        />
      </div>
      <template v-if="!floatCollapsed">
        <div class="score-float-total">
          <span class="num">{{ liveTotalScore }}</span>
          <span class="unit">分</span>
        </div>
        <div class="score-float-sub">
          共 {{ liveQuestionCount }} 题 · 及格 {{ postForm.passedScore || 0 }} 分
        </div>
        <div
          v-if="Number(postForm.totalScore) > 0"
          class="score-float-gap"
          :class="scoreGapClass"
        >
          {{ scoreGapText }}
        </div>
        <ul class="score-float-list">
          <li>
            <span>单选</span>
            <b>{{ typeStats.radio.count }}</b>
            <em>题</em>
            <strong>{{ typeStats.radio.score }}</strong>
          </li>
          <li>
            <span>多选</span>
            <b>{{ typeStats.multi.count }}</b>
            <em>题</em>
            <strong>{{ typeStats.multi.score }}</strong>
          </li>
          <li>
            <span>判断</span>
            <b>{{ typeStats.judge.count }}</b>
            <em>题</em>
            <strong>{{ typeStats.judge.score }}</strong>
          </li>
          <li>
            <span>简答</span>
            <b>{{ typeStats.saq.count }}</b>
            <em>题</em>
            <strong>{{ typeStats.saq.score }}</strong>
          </li>
          <li>
            <span>填空</span>
            <b>{{ typeStats.fill.count }}</b>
            <em>题</em>
            <strong>{{ typeStats.fill.score }}</strong>
          </li>
        </ul>
        <el-button type="primary" size="mini" class="score-float-save" @click="handleSave">保存</el-button>
      </template>
    </div>

    <!-- 保存前确认 -->
    <el-dialog
      title="确认考试设定"
      :visible.sync="confirmVisible"
      width="560px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="confirm-summary">
        <p class="confirm-tip">请核对以下设定，确认无误后再保存。</p>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="组卷方式">{{ confirmSummary.mode }}</el-descriptions-item>
          <el-descriptions-item label="考试名称">{{ confirmSummary.title }}</el-descriptions-item>
          <el-descriptions-item label="总分">{{ confirmSummary.totalScore }} 分</el-descriptions-item>
          <el-descriptions-item label="题目合计">{{ confirmSummary.liveTotal }} 分 / {{ confirmSummary.questionCount }} 题</el-descriptions-item>
          <el-descriptions-item label="及格分">{{ confirmSummary.passedScore }} 分</el-descriptions-item>
          <el-descriptions-item label="单选题">{{ confirmSummary.radio }}</el-descriptions-item>
          <el-descriptions-item label="多选题">{{ confirmSummary.multi }}</el-descriptions-item>
          <el-descriptions-item label="判断题">{{ confirmSummary.judge }}</el-descriptions-item>
          <el-descriptions-item label="简答题">{{ confirmSummary.saq }}</el-descriptions-item>
          <el-descriptions-item label="填空题">{{ confirmSummary.fill }}</el-descriptions-item>
          <el-descriptions-item label="填空需批改">{{ confirmSummary.fillNeedMark }}</el-descriptions-item>
          <el-descriptions-item label="考试时长">{{ confirmSummary.examDuration }} 分钟</el-descriptions-item>
          <el-descriptions-item label="最多切屏">{{ confirmSummary.maxCount }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ confirmSummary.timeRange }}</el-descriptions-item>
          <el-descriptions-item label="考试班级">{{ confirmSummary.classes }}</el-descriptions-item>
          <el-descriptions-item label="证书">{{ confirmSummary.certificates }}</el-descriptions-item>
          <el-descriptions-item v-if="confirmSummary.repoName" label="题库">{{ confirmSummary.repoName }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmVisible = false">返回修改</el-button>
        <el-button type="primary" :loading="saving" @click="confirmAndSave">确认保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchDetail } from '@/api/exam'
import RepoSelect from "@/components/RepoSelect";
import ClassSelect from "@/components/ClassSelect";
import CertificateSelect from "@/components/CertificateSelect";
import { saveData } from "@/api/exam";
import ChooseQuestion from "@/components/ExamComponents/ChooseQuestion";
export default {
  name: "ExamDetail",

  components: {
    RepoSelect,
    ChooseQuestion,
    ClassSelect,
    CertificateSelect,
  },
  data() {
    return {
      activeName: "first",
      floatCollapsed: false,
      confirmVisible: false,
      saving: false,
      selectedClassNames: [],
      selectedCertificateNames: [],
      selectedRepoName: "",
      input: "",
      treeData: [],
      defaultProps: {
        label: "deptName",
      },
      filterText: "",
      treeLoading: false,
      // dateValues: [],
      // 题库
      repoList: [
        {
          addQuType: "0",
          queIds: "",
          id: "",
          rowId: 0,
          radioCount: 0,
          radioScore: 0,
          multiCount: 0,
          multiScore: 0,
          judgeCount: 0,
          judgeScore: 0,
          saqCount: 0,
          saqScore: 0,
          fillCount: 0,
          fillScore: 0,
        },
      ],
      // 已选择的题库
      excludes: [],
      postForm: {
        start: [],
        // 总分（必填，须等于题目合计）
        totalScore: undefined,
        // 题库列表
        repoList: [],
        // 开放类型
        openType: 1,
        // 考试班级列表
        departIds: [],
        // 初始化班级列表
        classIds: [],
        fillNeedMark: 0,
      },
      rules: {
        title: [{ required: true, message: "考试名称不能为空！" }],

        // content: [{ required: true, message: '考试描述不能为空！' }],

        open: [{ required: true, message: "考试权限不能为空！" }],

        totalScore: [
          { required: true, message: "总分不能为空！" },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === "") {
                callback(new Error("总分不能为空！"));
                return;
              }
              if (Number(value) <= 0) {
                callback(new Error("总分必须大于 0！"));
                return;
              }
              callback();
            },
            trigger: "blur"
          }
        ],

        passedScore: [{ required: true, message: "及格分不能为空！" }],

        examDuration: [{ required: true, message: "考试时间不能为空！" }],

        start: [{ required: true, message: "考试时间范围不能为空！" }],

        maxCount: [{ required: false, message: "最多切屏次数" }],
        classIds: [
          {
            required: true,
            message: "请选择考试班级！",
            type: "array",
            min: 1,
          },
        ],
      },
    };
  },

  computed: {
    typeStats() {
      const item = (this.repoList && this.repoList[0]) || {};
      const pack = (count, score) => {
        const c = Number(count || 0);
        const s = Number(score || 0);
        return {
          count: c,
          score: c > 0 && s > 0 ? c * s : 0
        };
      };
      return {
        radio: pack(item.radioCount, item.radioScore),
        multi: pack(item.multiCount, item.multiScore),
        judge: pack(item.judgeCount, item.judgeScore),
        saq: pack(item.saqCount, item.saqScore),
        fill: pack(item.fillCount, item.fillScore)
      };
    },
    liveTotalScore() {
      const s = this.typeStats;
      return s.radio.score + s.multi.score + s.judge.score + s.saq.score + s.fill.score;
    },
    liveQuestionCount() {
      const s = this.typeStats;
      return s.radio.count + s.multi.count + s.judge.count + s.saq.count + s.fill.count;
    },
    scoreGap() {
      const full = Number(this.postForm.totalScore || 0);
      if (full <= 0) return 0;
      return full - this.liveTotalScore;
    },
    scoreGapText() {
      const gap = this.scoreGap;
      if (gap > 0) return `距总分还差 ${gap} 分`;
      if (gap < 0) return `已超出总分 ${Math.abs(gap)} 分`;
      return "已与总分一致";
    },
    scoreGapClass() {
      const gap = this.scoreGap;
      if (gap > 0) return "is-short";
      if (gap < 0) return "is-over";
      return "is-ok";
    },
    confirmSummary() {
      const s = this.typeStats;
      const fmtType = (row) => {
        if (!row.count) return "0 题";
        return `${row.count} 题 × ${Number(this.repoList[0][row.scoreKey] || 0)} 分 = ${row.score} 分`;
      };
      const start = this.postForm.start && this.postForm.start[0]
        ? this.formatDateDisplay(this.postForm.start[0])
        : "-";
      const end = this.postForm.start && this.postForm.start[1]
        ? this.formatDateDisplay(this.postForm.start[1])
        : "-";
      const mode = String(this.repoList[0].addQuType) === "1" ? "随机抽题" : "自己选题";
      return {
        mode,
        title: this.postForm.title || "-",
        totalScore: this.postForm.totalScore || 0,
        liveTotal: this.liveTotalScore,
        questionCount: this.liveQuestionCount,
        passedScore: this.postForm.passedScore || 0,
        radio: fmtType({ ...s.radio, scoreKey: "radioScore" }),
        multi: fmtType({ ...s.multi, scoreKey: "multiScore" }),
        judge: fmtType({ ...s.judge, scoreKey: "judgeScore" }),
        saq: fmtType({ ...s.saq, scoreKey: "saqScore" }),
        fill: fmtType({ ...s.fill, scoreKey: "fillScore" }),
        fillNeedMark: this.postForm.fillNeedMark ? "是" : "否",
        examDuration: this.postForm.examDuration || 0,
        maxCount: this.postForm.maxCount == null || this.postForm.maxCount === ""
          ? "不限制"
          : this.postForm.maxCount,
        timeRange: `${start} 至 ${end}`,
        classes: (this.selectedClassNames && this.selectedClassNames.length)
          ? this.selectedClassNames.join("、")
          : (this.postForm.classIds || []).join(",") || "-",
        certificates: (this.selectedCertificateNames && this.selectedCertificateNames.length)
          ? this.selectedCertificateNames.join("、")
          : "未选择",
        repoName: String(this.repoList[0].addQuType) === "1" ? (this.selectedRepoName || "-") : ""
      };
    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },

    // 题库变换：只同步题库列表，不覆盖用户填写的总分
    repoList: {
      handler(val) {
        this.excludes = [];
        for (let i = 0; i < val.length; i++) {
          this.excludes.push(val[i].id);
        }
        this.postForm.repoList = val;
        this.$forceUpdate();
      },
      deep: true,
    },
  },
  methods: {
    showCenterTip(message, type = "warning") {
      this.$alert(message, "提示", {
        type,
        confirmButtonText: "知道了",
        center: true,
        customClass: "exam-add-center-alert"
      });
    },
    assertScoreMatch() {
      const declared = Number(this.postForm.totalScore);
      if (!declared || declared <= 0) {
        this.showCenterTip("请填写总分！");
        return false;
      }
      if (declared !== this.liveTotalScore) {
        this.showCenterTip(
          `总分须等于所选题目合计（当前合计 ${this.liveTotalScore} 分，填写 ${declared} 分）`
        );
        return false;
      }
      if (this.liveTotalScore === 0) {
        this.showCenterTip("考试规则设置不正确，请确认！");
        return false;
      }
      return true;
    },
    // 点击tab
    handleClick(tab, event) {
      this.$refs.questionSelector.clearSelection();
      // console.log(event)
      this.repoList[0].addQuType = tab.index;
      this.repoList[0].queIds = "";
      this.repoList[0].id = "";
      this.repoList[0].rowId = 0;
      this.repoList[0].radioCount = 0;
      this.repoList[0].radioScore = 0;
      this.repoList[0].multiCount = 0;
      this.repoList[0].multiScore = 0;
      this.repoList[0].judgeCount = 0;
      this.repoList[0].judgeScore = 0;
      this.repoList[0].saqCount = 0;
      this.repoList[0].saqScore = 0;
      this.repoList[0].fillCount = 0;
      this.repoList[0].fillScore = 0;
      console.log(tab, event);
    },
    // 子组件选择的ids
    handleSelectedChange(selectedIds) {
      var ids = [];
      selectedIds.selectedRows.forEach((item) => {
        ids.push(item.id);
      });

      this.repoList[0].queIds = ids.join(",");
      this.repoList[0].radioCount = selectedIds.questionList.radioCount;
      this.repoList[0].radioScore = selectedIds.questionList.radioScore;
      this.repoList[0].multiCount = selectedIds.questionList.multiCount;
      this.repoList[0].multiScore = selectedIds.questionList.multiScore;
      this.repoList[0].judgeCount = selectedIds.questionList.judgeCount;
      this.repoList[0].judgeScore = selectedIds.questionList.judgeScore;
      this.repoList[0].saqCount = selectedIds.questionList.saqCount;
      this.repoList[0].saqScore = selectedIds.questionList.saqScore;
      this.repoList[0].fillCount = selectedIds.questionList.fillCount;
      this.repoList[0].fillScore = selectedIds.questionList.fillScore;
      console.log("从子组件接收到的选中ID:", this.repoList);
      // 在这里你可以将选中的ID保存到父组件的数据中
      this.selectedQuestionIds = selectedIds;
      // 或者执行其他需要的操作
    },
    handleSave() {
      if (this.repoList[0].addQuType === "1") {
        this.$refs.postForm.validate((valid) => {
          if (!valid) {
            return;
          }
          if (!this.assertScoreMatch()) {
            return;
          }

          // 验证班级是否选择
          if (!this.postForm.classIds || this.postForm.classIds.length === 0) {
            this.showCenterTip("请选择考试班级！");
            return;
          }

          for (let i = 0; i < this.postForm.repoList.length; i++) {
            const repo = this.postForm.repoList[i];
            if (!repo.repoId) {
              this.showCenterTip("考试题库选择不正确！");
              return;
            }

            if (
              (repo.radioCount > 0 && repo.radioScore === 0) ||
              (repo.radioCount === 0 && repo.radioScore > 0)
            ) {
              this.showCenterTip("题库第：[" + (i + 1) + "]项存在无效的单选题配置！");

              return;
            }

            if (
              (repo.multiCount > 0 && repo.multiScore === 0) ||
              (repo.multiCount === 0 && repo.multiScore > 0)
            ) {
              this.showCenterTip("题库第：[" + (i + 1) + "]项存在无效的多选题配置！");

              return;
            }

            if (
              (repo.judgeCount > 0 && repo.judgeScore === 0) ||
              (repo.judgeCount === 0 && repo.judgeScore > 0)
            ) {
              this.showCenterTip("题库第：[" + (i + 1) + "]项存在无效的判断题配置！");
              return;
            }

            if (
              (repo.saqCount > 0 && repo.saqScore === 0) ||
              (repo.saqCount === 0 && repo.saqScore > 0)
            ) {
              this.showCenterTip("题库第：[" + (i + 1) + "]项存在无效的简答题配置！");
              return;
            }

            if (
              (repo.fillCount > 0 && repo.fillScore === 0) ||
              (repo.fillCount === 0 && repo.fillScore > 0)
            ) {
              this.showCenterTip("题库第：[" + (i + 1) + "]项存在无效的填空题配置！");
              return;
            }
          }

          this.openConfirmDialog();
        });
      }
      if (this.repoList[0].addQuType === "0") {
        this.$refs.postForm.validate((valid) => {
          if (!valid) {
            return;
          }
          if (!this.assertScoreMatch()) {
            return;
          }
          if (!this.postForm.classIds || this.postForm.classIds.length === 0) {
            this.showCenterTip("请选择考试班级！");
            return;
          }
          this.openConfirmDialog();
        });
      }
    },

    openConfirmDialog() {
      // 打开前补全班级/证书名称（避免未触发 change 时只有 ID）
      const classSel = this.$refs.classSelect;
      if (classSel && classSel.classList && this.postForm.classIds) {
        const ids = Array.isArray(this.postForm.classIds)
          ? this.postForm.classIds
          : [this.postForm.classIds];
        this.selectedClassNames = classSel.classList
          .filter((c) => ids.includes(c.id))
          .map((c) => c.gradeName);
      }
      const certSel = this.$refs.certificateSelect;
      if (certSel && certSel.certificateList && this.postForm.certificateId) {
        const ids = Array.isArray(this.postForm.certificateId)
          ? this.postForm.certificateId
          : [this.postForm.certificateId];
        this.selectedCertificateNames = certSel.certificateList
          .filter((c) => ids.includes(c.id))
          .map((c) => c.certificateName);
      }
      this.confirmVisible = true;
    },

    confirmAndSave() {
      this.confirmVisible = false;
      this.submitForm();
    },

    formatDateDisplay(date) {
      if (!date) return "-";
      const d = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(d.getTime())) return String(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day} ${h}:${min}`;
    },

    handleCheckChange() {
      const that = this;
      // 置空
      this.postForm.departIds = [];
      const nodes = this.$refs.tree.getCheckedNodes();
      nodes.forEach(function (item) {
        that.postForm.departIds.push(item.id);
      });
    },

    // 添加子项
    handleAdd() {
      this.repoList.push();
    },

    removeItem(index) {
      this.repoList.splice(index, 1);
    },
    formatDateToISOString(date) {
      if (!(date instanceof Date)) {
        return null;
      }

      // 获取本地时间的各部分（不进行时区转换）
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      // 格式化为本地时间字符串（不含时区信息）
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      // 输出示例："2025-05-14 09:00:00"（保留用户选择的本地时间）
    },

    submitForm() {
      console.log("postForm", this.postForm);
      // 校验和处理数据
      let cerTemp = "";
      if (
        this.postForm.certificateId != null &&
        this.postForm.certificateId != ""
      ) {
        console.log(this.postForm.certificateId);
        cerTemp = this.postForm.certificateId.join(",");
      }
      this.postForm.repoList = this.repoList;

      const params = {
        title: this.postForm.title,
        // content: this.postForm.content, // 添加考试描述字段
        examDuration: this.postForm.examDuration,
        maxCount: this.postForm.maxCount,
        passedScore: this.postForm.passedScore,
        startTime: this.formatDateToISOString(this.postForm.start[0]),
        endTime: this.formatDateToISOString(this.postForm.start[1]),
        gradeIds: this.postForm.classIds.join(","),
        repoId: this.postForm.repoList[0].repoId,
        certificateId: cerTemp,
        addQuype: this.postForm.repoList[0].addQuType,
        quIds: this.postForm.repoList[0].queIds,
        radioCount: this.postForm.repoList[0].radioCount,
        radioScore: this.postForm.repoList[0].radioScore,
        multiCount: this.postForm.repoList[0].multiCount,
        multiScore: this.postForm.repoList[0].multiScore,
        judgeCount: this.postForm.repoList[0].judgeCount,
        judgeScore: this.postForm.repoList[0].judgeScore,
        saqCount: this.postForm.repoList[0].saqCount,
        saqScore: this.postForm.repoList[0].saqScore,
        fillCount: this.postForm.repoList[0].fillCount,
        fillScore: this.postForm.repoList[0].fillScore,
        fillNeedMark: this.postForm.fillNeedMark ? 1 : 0,
      };
      this.saving = true;
      saveData(params).then((res) => {
        if (res.code) {
          this.showCenterTip("考试保存成功！", "success");

          this.$router.push({ name: "exam-management" });
        } else {
          this.showCenterTip(res.msg || "保存失败", "error");
        }
      }).finally(() => {
        this.saving = false;
      });
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.deptName.indexOf(value) != -1;
    },
    onCertificateChange(list) {
      this.selectedCertificateNames = (list || []).map(
        (c) => c.certificateName || c.name || c.id
      );
    },
    onClassChange(list) {
      this.selectedClassNames = (list || []).map(
        (c) => c.gradeName || c.name || c.id
      );
    },
    repoChange(e, row) {
      // 赋值ID
      row.id = e.id;
      if (e != null) {
        row.totalRadio = e.radioNum;
        row.totalMulti = e.multiNum;
        row.totalJudge = e.judgeNum;
        row.totalSaq = e.saqNum;
        row.totalFill = e.fillNum;
        this.selectedRepoName = e.title || e.repoTitle || e.name || "";
      } else {
        row.totalRadio = 0;
        row.totalMulti = 0;
        row.totalJudge = 0;
        row.totalSaq = 0;
        row.totalFill = 0;
        this.selectedRepoName = "";
      }
    },
  },
};
</script>

<style scoped>
.exam-form-page .page-desc {
  margin: -6px 0 14px 14px;
}

.exam-form-page .section-gap {
  margin-top: 28px;
}

.exam-form-page .form-card {
  margin-top: 4px;
  border-radius: 16px;
}

.exam-form-page {
  padding-right: 220px;
  box-sizing: border-box;
}

.random-repo-table .count-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  gap: 4px;
}

.random-repo-table .count-input,
.random-repo-table .score-input {
  width: 72px;
}

.random-repo-table .count-total {
  flex-shrink: 0;
  color: #909399;
  white-space: nowrap;
}

.inline-hint {
  margin-left: 10px;
  color: #94a3b8;
  font-size: 12px;
}

.score-float {
  position: fixed;
  top: 120px;
  right: 24px;
  z-index: 20;
  width: 188px;
  padding: 14px 14px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transition: width 0.2s ease;
  max-height: calc(100vh - 160px);
  overflow: auto;
  box-sizing: border-box;
}

.score-float.collapsed {
  width: 44px;
  padding: 10px 6px;
  overflow: hidden;
}

.score-float-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.score-float-toggle {
  padding: 0;
  color: #64748b;
}

.score-float-total {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.score-float-total .num {
  font-size: 28px;
  font-weight: 800;
  color: #0d9488;
  line-height: 1;
}

.score-float-total .unit {
  font-size: 13px;
  color: #64748b;
}

.score-float-sub {
  margin-bottom: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.score-float-gap {
  margin-bottom: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.score-float-gap.is-short {
  color: #b45309;
  background: #fffbeb;
}

.score-float-gap.is-over {
  color: #b91c1c;
  background: #fef2f2;
}

.score-float-gap.is-ok {
  color: #0f766e;
  background: #f0fdfa;
}

.score-float-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
}

.score-float-list li {
  display: grid;
  grid-template-columns: 32px 20px 1fr auto;
  gap: 4px;
  align-items: center;
  padding: 6px 0;
  border-top: 1px dashed #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.score-float-list li b {
  color: #334155;
  font-weight: 600;
}

.score-float-list li em {
  font-style: normal;
  color: #94a3b8;
}

.score-float-list li strong {
  color: #0d9488;
  font-weight: 700;
}

.score-float-save {
  width: 100%;
}

.confirm-summary .confirm-tip {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
}

@media screen and (max-width: 1200px) {
  .score-float {
    top: auto;
    bottom: 20px;
    right: 16px;
  }
}

@media screen and (max-width: 768px) {
  .score-float {
    width: 160px;
  }

  .score-float.collapsed {
    width: 40px;
  }
}
</style>

<style>
/* MessageBox 挂到 body，需非 scoped */
.exam-add-center-alert {
  width: 520px !important;
  max-width: 92vw;
  padding-bottom: 18px;
}

.exam-add-center-alert .el-message-box__title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.exam-add-center-alert .el-message-box__message {
  font-size: 17px;
  line-height: 1.7;
  color: #334155;
  padding-left: 8px;
  padding-right: 8px;
}

.exam-add-center-alert .el-message-box__status {
  font-size: 28px !important;
}

.exam-add-center-alert .el-button {
  font-size: 15px;
  padding: 10px 22px;
}
</style>
